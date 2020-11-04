import pb from 'protobufjs';
import { format } from 'prettier';
import glob from 'glob';
import util from 'util';

interface Options {
  parse?: pb.IParseOptions;
  serialize?: {
    optional?: boolean;
    list?: boolean;
  };
  types?: Partial<Record<ProtoType, string>>;
}
interface Context extends Options {
  out: string[];
  serialize: { optional: boolean; list: boolean };
  types: Record<string, string>;
}
export default async function gRPCTypes(
  pattern: string,
  {
    parse = {
      alternateCommentMode: true,
      preferTrailingComment: true,
    },
    serialize = {},
    types = {},
  }: Options = {}
): Promise<string> {
  // eslint-disable-next-line no-underscore-dangle
  const filenames = await util.promisify(glob)(pattern);
  const root = await load(filenames, parse);
  const { optional = false, list = true } = serialize;
  const ctx: Context = {
    out: [],
    serialize: { optional, list },
    types: { ...types, ...TYPES },
  };
  rpc(root, ctx);
  const output = format(ctx.out.join('\n'), { parser: 'typescript' });
  return output;
}

async function load(
  filename: string[],
  options: pb.IParseOptions
): Promise<pb.Root> {
  const root = new pb.Root();
  await root.load(filename, options);
  root.resolveAll();
  return root;
}

function rpc(root: pb.Root, ctx: Context) {
  ctx.out.push('declare namespace rpc {');
  root.nestedArray.forEach((x) => namespace(x as pb.Namespace, ctx));
  ctx.out.push('}');
}

function namespace(ns: pb.Namespace, ctx: Context) {
  comment(ns.comment, ctx);
  ctx.out.push(`declare namespace ${ns.name}{`);
  ns.nestedArray.forEach((x) => {
    if (x instanceof pb.Service) {
      service(x, ctx);
    } else if (x instanceof pb.Type) {
      message(x, ctx);
    } else if (x instanceof pb.Enum) {
      enums(x, ctx);
    } else {
      throw new Error('not expect namespace nested');
    }
  });
  ctx.out.push('}');
}
function service(node: pb.Service, ctx: Context) {
  comment(node.comment, ctx);

  ctx.out.push(`interface ${node.name}{`);
  node.methodsArray.forEach((x) => serviceMethod(x, ctx));
  ctx.out.push('}');
}
function serviceMethod(node: pb.Method, ctx: Context) {
  comment(node.comment, ctx);
  const request = typeName(node.requestType, ctx);
  const response = typeName(node.responseType, ctx);
  ctx.out.push(`${node.name}: (request: ${request})=> Promise<${response}>;`);
}

function message(node: pb.Type, ctx: Context) {
  comment(node.comment, ctx);
  ctx.out.push(`interface ${node.name}{`);
  node.fieldsArray.forEach((x) => messageField(x, ctx));
  ctx.out.push('}');
}
function messageField(node: pb.Field, ctx: Context) {
  const optional = ctx.serialize.optional && node.optional ? '?' : '';
  const repeated = node.repeated ? '[]' : '';
  const type = typeName(node.type, ctx);
  const name =
    node.repeated && ctx.serialize.list ? `${node.name}List` : node.name;
  ctx.out.push(`${name}${optional}: ${type}${repeated};`);
}

function enums(node: pb.Enum, ctx: Context) {
  comment(node.comment, ctx);
  ctx.out.push(`enum ${node.name}{`);
  Object.entries(node.values).forEach(([key, value]) => {
    comment(node.comments[key], ctx);
    ctx.out.push(`${key}=${value},`);
  });
  ctx.out.push('}');
}
function typeName(type: string, ctx: Context) {
  const out = ctx.types[type];
  if (out) {
    return out;
  }
  if (type[0] === '.') {
    return type.substr(1);
  }
  return type;
}
type ProtoType =
  | 'float'
  | 'double'
  | 'int32'
  | 'uint32'
  | 'int64'
  | 'uint64'
  | 'fixed32'
  | 'fixed64'
  | 'sfixed32'
  | 'sfixed64'
  | 'bool'
  | 'bytes'
  | 'string';

const TYPES: Record<ProtoType, string> = {
  float: 'number',
  double: 'number',
  int32: 'number',
  uint32: 'number',
  int64: 'BigInt',
  uint64: 'BigInt',
  fixed32: 'number',
  fixed64: 'BigInt',
  sfixed32: 'number',
  sfixed64: 'BigInt',
  bool: 'boolean',
  bytes: 'Buffer',
  string: 'string',
};
function comment(ns: string | null | undefined, ctx: Context) {
  if (ns) {
    const array = ns.split('\n');
    ctx.out.push('');
    ctx.out.push('/**');
    array.forEach((x) => ctx.out.push(`* ${x}`));
    ctx.out.push(' */');
  }
}
