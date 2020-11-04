import { join } from 'path';
import gRPCTypes from '../src/grpc-types';

it('normal', async () => {
  const output = await gRPCTypes(join(__dirname, './proto/**/*.proto'));
  expect(output).toMatchInlineSnapshot(`
    "declare namespace rpc {
      declare namespace hello {
        interface Greeter {
          SayHello: (request: user.User) => Promise<HelloReply>;
        }
        interface HelloRequest {
          string: user.User;
        }
        interface HelloReply {
          message: string;
        }
      }
      declare namespace user {
        interface User {
          name: string;
          sex: boolean;
          age: number;
          birth: BigInt;
          userList: User[];
        }
        enum Role {
          NONE = 0,
          ROOT = 1,
          MANAGER = 2,
        }
      }
    }
    "
  `);
});
