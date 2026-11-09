List Vue single-file components that exceed a cyclomatic complexity threshold. The tool parses each `.vue` file as a Vue SFC and counts `v-if`, `v-else-if`, and `v-for` directives in its template. Each component starts at a complexity of 1.

Vue files are discovered recursively from the current directory. `node_modules` and `.git` are skipped.

Errors are written to stderr with a stable code and set the process exit code to `1`. A component above the configured threshold reports `COMPLEXITY_THRESHOLD_EXCEEDED`. Other codes are `INVALID_THRESHOLD`, `FILE_READ_ERROR`, `SFC_PARSE_ERROR`, and `TEMPLATE_PARSE_ERROR`.

# Usage
```
cd path/to/vue/project
npx vue-complexity
```
If you would like to specify the cyclomatic complexity, please run the command as following:
```
cd path/to/vue/project
npx vue-complexity {the number of complexity}
```

Svelte components are handled by the separate [`svelte-complexity`](../svelte-complexity) package.
