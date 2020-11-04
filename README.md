# grpc proto 编译为 typescript 的 d.ts

将 \*.proto 编译

## Example

hello.proto

```proto
syntax = "proto3";
package hello;

service Greeter {
    rpc SayHello(.user.User) returns (HelloReply) {};
}

message HelloRequest {
  .user.User string = 1;
}

message HelloReply {
  string message = 1;
}
```

user.proto

```proto
syntax = "proto3";
package hello;

service Greeter {
    rpc SayHello(.user.User) returns (HelloReply) {};
}

message HelloRequest {
  .user.User string = 1;
}

message HelloReply {
  string message = 1;
}
```

编译后

```ts
declare namespace rpc {
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
```
