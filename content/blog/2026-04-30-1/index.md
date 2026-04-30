---
title: "Create GPG certification"
slug: "draft-1"
date: 2026-04-30
authors: []
published: false
description: ""
---
```bash
$ brew install gpg2 pinentry-mac
$ gpg --version

$ gpg --full-generate-key

$ gpg --list-secret-keys --keyid-format LONG
--------------------------------
sec   rsa4096/F37EC01B0043942F 2020-03-03 [SC]
      EF16707734FF80A4F4F3F740F37EC01B0043942F
uid                 [] Tomoya Amachi <tomoya.amachi@gmail.com>
ssb   rsa4096/ACBA2B05D8E0C86F 2020-03-03 [E]

$ gpg --armor --export F37EC01B0043942F
-----BEGIN PGP PUBLIC KEY BLOCK-----
...
-----END PGP PUBLIC KEY BLOCK-----

# 1. go to https://github.com/settings/keys
# 2. click "New GPG Key" 
# 3. paste the key

$ git config --global user.signingkey F37EC01B0043942F
$ git config --global commit.gpgSign true
# auto sign
$ echo 'export GPG_TTY=$(tty)' >> ~/.bash_profile
$ export GPG_TTY=$(tty)
```

[https://help.github.com/en/github/authenticating-to-github/about-commit-signature-verification](https://help.github.com/en/github/authenticating-to-github/about-commit-signature-verification)
