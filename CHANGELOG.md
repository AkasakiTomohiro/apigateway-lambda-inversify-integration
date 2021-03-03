# Changelog

## v1.0.0

First Version

## v2.0.0

Introduced a custom validation mechanism, separate from the validation used in the early days of V1.
Not compatible with V1 series.

## v3.0.0

Fixed a bug where the type of `this` of a function that was supposed to be called from HttpMethodController was not a subclass of HttpMethodController.

## v3.0.1

Added `apigateway-lambda-inversify-integration-jest` library, adjusted for v3.0.0, to the dependencies so that unit tests are executed correctly.
