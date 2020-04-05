import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as iam from "./iam";

const config = new pulumi.Config();

let users = config.requireObject<iam.UserDef[]>("users");

let iamInputs = <iam.IamInputs>{
    users: users
}

let iamOutputs = iam.defineIam(iamInputs);

exports.SecretKeyParameters = iamOutputs.secretKeyParameters.map(p => p.arn);