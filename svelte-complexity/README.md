# svelte-complexity

List Svelte components that exceed a cyclomatic complexity threshold. The tool recursively discovers `.svelte` files from the current directory, skipping `node_modules` and `.git`.

It counts `{#if}` blocks (including `{:else if}`) and `{#each}` blocks in component markup. Script logic is not included. Each component starts at a complexity of 1.

Errors are written to stderr with a stable code and set the process exit code to `1`. A component above the configured threshold reports `COMPLEXITY_THRESHOLD_EXCEEDED`. Other codes are `INVALID_THRESHOLD`, `FILE_READ_ERROR`, and `SVELTE_PARSE_ERROR`.

## Usage

```sh
cd path/to/svelte/project
npx svelte-complexity
```

Pass a numeric threshold as the first argument (default: `10`):

```sh
npx svelte-complexity 5
```
