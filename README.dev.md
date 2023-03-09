# Publish to npm

Normal commits will only be tested by CI - nothing more. To trigger publishing
to npm, you need to push [a tagged
commit](https://git-scm.com/book/en/v2/Git-Basics-Tagging).

Here is how you do this:

-   increment version
    -   patch
    ```console
    $ npm version patch
    v0.0.10
    ```
    -   minor
    ```console
    $ npm version minor
    v0.1.0
    ```
    -   major
    ```console
    $ npm version major
    v1.0.0
    ```
-   npm has increased version number in `package.json` and `package-lock.json`
    and created a tagged commit with this new version number

-   now push commit and tag

    ```console
    $ git push --follow-tags
    ...
    To github.com:snapview/sunrise.git
       90c4052..e0bc73d  master -> master
     * [new tag]         v0.0.9 -> v0.0.9

    ```

## Format the code

### ignore-revs-file

Sometimes (after long and bloody discussions) we decide to change `.prettierrc.json`. It leads to a huge commit,
as `Prettier` automatically reformats all the project files in a pre-commit hook. This commit has no use for git-blame,
so we'd like to ignore it, i.e. see the blame of previous commit for strings affected by reformatting.
Here comes [.git-blame-ignore-revs](./.git-blame-ignore-revs) file where we list such commits.  
To make it work in your local repo, run

```shell
git config blame.ignoreRevsFile .git-blame-ignore-revs
```
