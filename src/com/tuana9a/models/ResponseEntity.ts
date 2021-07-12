export class ResponseEntity {
    code: number = 0;
    message: string = null;
    data: any = null;

    static builder() {
        return new this.ResponseEntityBuilder();
    }
}
export namespace ResponseEntity {
    export class ResponseEntityBuilder {
        object: ResponseEntity;
        constructor() {
            this.object = new ResponseEntity();
        }
        code(code: number) {
            this.object.code = code;
            return this;
        }
        message(message: string) {
            this.object.message = message;
            return this;
        }
        data(data: any) {
            this.object.data = data;
            return this;
        }
        build() {
            return this.object;
        }
    }
}
