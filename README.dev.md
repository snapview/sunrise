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
