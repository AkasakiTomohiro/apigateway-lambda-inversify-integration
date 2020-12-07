# Readme

apigateway-lambda-inversify-integration

## Why I wanted to create this library

When I combined the API Gateway and Lambda, I developed separate entry points for each URI and HTTP method.
But even though the entry points are different, the source code for accessing the database is the same.
So, when we bundle with Webpack, we place the same source code in each Lambda with different entry points.
Preparing this same source for as many APIs as possible is wasteful in terms of S3's fee for deploying the source (which is not a significant amount of money), and adding integration tests, like entry points, is a pain in the ass.
In addition, when performing validation of API Gateway parameters, it is difficult to verify whether YAML is set correctly in unit tests, but we verify it with joint tests.
This is also quite cumbersome, so I want to verify it with unit tests.
We created this library to solve these problems.

## Usage

Refer to the source of the example folder.
