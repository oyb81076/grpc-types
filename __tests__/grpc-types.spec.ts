import { join } from 'path';
import gRPCTypes from '../src/grpc-types';

it('normal', async () => {
  const output = await gRPCTypes(join(__dirname, './proto/**/*.proto'));
  expect(output).toMatchInlineSnapshot(`
    "declare namespace rpc {
      declare namespace hello {
        /**
         * The greeting service definition.
         */
        interface Greeter {
          /**
           * Some Comment
           * Others
           */
          SayHello: (request: user.User) => Promise<HelloReply>;
        }

        /**
         * The request message containing the user's name.
         */
        interface HelloRequest {
          string: user.User;
        }

        /**
         * The response message containing the greetings
         */
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
