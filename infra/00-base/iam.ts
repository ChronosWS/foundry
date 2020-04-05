import * as pulumi from "@pulumi/pulumi"
import * as fs from "fs"
import { Base64 } from "js-base64";
import * as aws from "@pulumi/aws"

export interface UserDef {
    name: string,
    pgpKeyPath: string,
}

export interface IamInputs {
    users: UserDef[]
}

export interface IamOutputs {
    secretKeyParameters: aws.ssm.Parameter[]
}

export function defineIam(inputs: IamInputs): IamOutputs {
    let params: aws.ssm.Parameter[] = new Array<aws.ssm.Parameter>();
    for (let userDef of inputs.users) {
        let user = new aws.iam.User(`user-${userDef.name}`, {
            name: `foundry-${userDef.name}`,
            path: "/foundry/",
            tags: {
                Project: `foundry-${pulumi.getProject()}`,
                Stack: `${pulumi.getStack()}`
            }
        });

        let key_path = `../../etc/public_keys/${userDef.name}.pub`;
        let accessKey = new aws.iam.AccessKey(`access-key-${userDef.name}`, {
            user: user.id,
            pgpKey: fs.readFileSync(userDef.pgpKeyPath).toString('base64'),
        });

        let secretParam = new aws.ssm.Parameter(`access-key-secret-${userDef.name}`, {
            type: "String",
            value: accessKey.encryptedSecret,
            tags: {
                Project: `foundry-${pulumi.getProject()}`,
                Stack: `${pulumi.getStack()}`
            }
        });

        params.push(secretParam);
    }

    return <IamOutputs>{
        secretKeyParameters: params
    }
}