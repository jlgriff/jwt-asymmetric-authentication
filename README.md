# Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Authentication](#authentication)
   1. [Creating an RSA key pair](#creating-an-rsa-key-pair)
   2. [Adding .env configs](#adding-env-configs)
   3. [Creating a signed token](#creating-a-signed-token)
   4. [Authenticating a signed token](#authenticating-a-signed-token)

# Introduction

This module can be used to implement asymmetric authentication in a node.js architecture. Using the functions here, JWT tokens can not only be signed with a private key, but also have their authenticity validated with a public key.

**Why would you want to do this?**

This pattern is useful in a system architecture with multiple backend services communicating with each other.

If authenticate was **symmetric**, either:

1. Only one service would have the JWT secret key, which means that all other services have to validate their tokens against that keyholding service. This creates a bottleneck, since all requests with tokens have to get authenticated via that service.
2. Each service that needs to authenticate tokens has a copy of the JWT secret key, which reduces security by duplicating the secret and allowing multiple services to be able to sign valid tokens.

By implementing **asymmetric** authentication though:

1. Only a single service needs access to the secret/private key necessary to sign tokens.
2. All other services have access to a corresponding public key, which can be used to authenticate tokens but not sign them.

Thus, this solution avoids both the bottleneck and the security concerns that come with symmetric authentication.

# Installation

This repo can be used as a dependency by pulling it from from the [public GitHub repository](https://github.com/jlgriff/jwt-asymmetric-authentication). To do this, the following can be added to the `dependencies` block in the project's `package.json`:

```
"jwt-asymmetric-authentication": "git+ssh://git@github.com:jlgriff/jwt-asymmetric-authentication.git#main"
```

Alternatively, pull the code from a specific commit hash:

```
"jwt-asymmetric-authentication": "git+ssh://git@github.com:jlgriff/jwt-asymmetric-authentication.git#<commit-hash>"
```

_Note: This hasn't been published to npm. If you want to see it published, let me know by creating an issue on the [Issues](https://github.com/jlgriff/jwt-asymmetric-authentication/issues) page._

# Authentication

The `generateToken` function will create signed tokens with the private key while the `isTokenAuthentic` function will validate those tokens with the public key.

### Creating an RSA key pair

To create a public/private RSA key pair:

1. Generate the private key:
   ```
   openssl genrsa -out private.pem 2048
   ```
2. Generate the corresponding public key:
   ```
   openssl rsa -in private.pem -outform PEM -pubout -out public.pem
   ```
3. Create a root-level `/keys/` directory in the service implementing this module. If the service needs to _authenticate_ tokens, add the `public.pem` key to the `/keys/` directory. If the service needs to _create_ tokens, add the `private.pem` key to the `/keys/` directory.
4. **Do not commit your key files!** Ensure that your public & private key files are listed in your .gitignore.

### Adding .env configs

Add the following configs to the service's `.env` file:

1. `KEY_PATH_PRIVATE`: The filepath to the private key. e.g. `/keys/private.pem`
2. `KEY_PATH_PUBLIC`: The filepath to the public key. e.g. `/keys/public.pem`

### Creating a signed token

If your `private.pem` token is in the root-level `/keys/` directory, call the `generateToken` function with its required parameters & the custom payload.

_Note_: The generated token must include `issued` and `expires` Date fields.

### Authenticating a signed token

If your `public.pem` token is in the root-level `/keys/` directory, call the `isTokenAuthentic` function with the token string.
