declare const data: {
  openapi: "3.1.0";
  info: { title: "app"; version: "version" };
  paths: {
    "/api/post": {
      post: {
        responses: {
          "200": {
            description: "Successful operation";
            content: { "application/json": { schema: {} } };
          };
        };
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreatePostInput" };
            };
          };
        };
        operationId: "CreateApiPost";
      };
      put: {
        responses: {
          "200": {
            description: "Successful operation";
            content: { "application/json": { schema: {} } };
          };
        };
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreatePostInput" };
            };
          };
        };
        operationId: "UpdateApiPost";
      };
    };
    "/api/post/{id}": {
      get: {
        parameters: [
          {
            in: "path";
            name: "id";
            schema: { type: "number" };
            required: true;
          }
        ];
        responses: {
          "200": {
            description: "Successful operation";
            content: { "application/json": { schema: {} } };
          };
        };
        operationId: "GetApiPost";
      };
      delete: {
        parameters: [
          {
            in: "path";
            name: "id";
            schema: { type: "string" };
            required: true;
          }
        ];
        responses: {
          "200": {
            description: "Successful operation";
            content: { "application/json": { schema: {} } };
          };
        };
        operationId: "DeleteApiPost";
      };
    };
    "/foo": {
      get: {
        responses: {
          "200": {
            description: "Successful operation";
            content: { "application/json": { schema: {} } };
          };
        };
        operationId: "GetFoo";
      };
    };
  };
  components: {
    schemas: {
      CreatePostInput: {
        additionalProperties: false;
        type: "object";
        properties: { title: { type: "string" } };
        required: ["title"];
      };
    };
    responses: {};
    parameters: {};
    examples: {};
    requestBodies: {};
    headers: {};
    securitySchemes: {};
    links: {};
    callbacks: {};
  };
  tags: [];
  servers: [];
};

export default data;
