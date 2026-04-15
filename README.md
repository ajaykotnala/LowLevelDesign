# LLD Design Patterns (TypeScript)
 
This repository is for learning and implementing software design patterns in TypeScript.
It is intended to include:

- Creational patterns
- Structural patterns
- Behavioral patterns

## Prerequisites

- Node.js installed (includes `npm` and `npx`)

## Run patterns

### Run default sample

From the repo folder (`LLD`) run:

```powershell
npm run run
```

### Run a specific file directly

```powershell
npx -y ts-node <file-name>.ts
```

Example:

```powershell
npx -y ts-node factory-pattern.ts
```

### NPM helper scripts

- `npm run run` - runs the default sample (`factory-pattern.ts`)
- `npm run run:factory` - runs the factory pattern sample
- `npm run run:file -- <file-name>.ts` - runs any pattern file

## Suggested repo structure

As this grows, you can organize files like this:

```text
creational/
structural/
behavioral/
```

