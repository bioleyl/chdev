# Windows Development Guide

This guide covers everything you need to know to develop the ChDev backend on Windows.

## Prerequisites

### 1. Node.js & npm
- Install the latest LTS version from [nodejs.org](https://nodejs.org/) or via [nvm-windows](https://github.com/coreybutler/nvm-windows).
- Verify installation:
  ```powershell
  node -v   # Should be v20+
  npm -v    # Should be 10+
  ```

### 2. Python (for native module compilation)
`better-sqlite3` requires a C++ compiler. Python is needed to run `node-gyp`:
- Install Python 3.11+ from [python.org](https://www.python.org/downloads/).
- Check the **"Add Python to PATH"** checkbox during installation.
- Verify:
  ```powershell
  python --version
  ```

### 3. Build Tools
Install the Windows Build Tools required for compiling native Node modules:
```powershell
npm install --global windows-build-tools
```
Or install manually via the [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) installer (select **"C++ build tools"** workload).

## Getting Started

### 1. Install dependencies
From the project root:
```powershell
cd chdev
npm install
```

This will compile `better-sqlite3` for your platform automatically.

### 2. Set up environment
```powershell
cd backend
copy .env.example .env
```
Edit `.env` as needed (the defaults work for development).

### 3. Build the common package
```powershell
npm run build -w common
```

### 4. Run migrations & seed data
```powershell
npm run db:migrate
npm run db:seed
```

### 5. Start the development server
From the project root:
```powershell
npm run dev:api
```
Or from the backend directory:
```powershell
npm run dev
```

The API will be available at `http://localhost:3000`.

## Path & File Resolution Notes

### Database path (`DB_PATH`)
If you set a custom `DB_PATH`, use **forward slashes** or **escaped backslashes**:
```
DB_PATH=C:/Users/You/chdev/backend/data/chdev.db
# or
DB_PATH=C:\Users\You\chdev\backend\data\chdev.db
```
The code uses `path.resolve()` internally, so both formats work.

### Default database location
By default, the database is created at `backend/data/chdev.db` relative to the project root. The path is resolved from the project root using `path.resolve()`, which produces the correct Windows path automatically.

## Known Windows-Specific Behaviors

### File separators in invoice numbers
Invoice numbers use `-` as the separator (e.g., `INV-2026-0001`) to avoid conflicts with Windows filename restrictions. The `/` character is **not** used.

### PDF downloads
When downloading a PDF invoice, the filename is sanitized to remove characters invalid on Windows (`< > : " / \ | ? *`).

### Line endings
The project uses LF (`\n`) line endings consistently (enforced via `.editorconfig`). On Windows, configure Git:
```powershell
git config --global core.autocrlf input
```
This prevents Git from converting LF to CRLF on commit.

### Case sensitivity
Windows filesystems are case-insensitive by default. TypeORM entity imports use `.js` extensions (e.g., `./user.entity.js`). This works correctly on Windows, but ensure your imports match the case of the actual file names.

## Troubleshooting

### `better-sqlite3` compilation fails
1. Ensure Python 3.11+ is installed and on PATH.
2. Ensure Visual Studio Build Tools (C++ workload) are installed.
3. Try cleaning and reinstalling:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Force package-lock.json
   npm install
   ```

### Database path errors
If you get "unable to open database file" errors:
1. Ensure the `backend/data/` directory exists:
   ```powershell
   mkdir -Force backend\data
   ```
2. Verify `DB_PATH` in `.env` points to a valid, writable path.

### Import resolution errors
If you see errors like "Cannot find module":
1. Ensure the common package is built: `npm run build -w common`
2. Check that all `.ts` imports have `.js` extensions (required for ESM).

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run production build |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed sample data |
