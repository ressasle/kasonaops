# Git Workflow & Setup for Kasona Ops

## Repository Info

- **Remote URL**: `https://github.com/ressasle/kasonaops.git`
- **Main Branch**: `main`

## Setup for Team Members

### 1. Clone the Repository

```bash
git clone https://github.com/ressasle/kasonaops.git
cd kasonaops
```

### 2. Install Dependencies

The main application is in `the list tool` (pending rename to `app`).

```bash
cd "the list tool"
npm install
```

## Daily Workflow

### 1. Get Latest Changes

Always pull before starting work to avoid conflicts.

```bash
git pull origin main
```

### 2. Create a Feature Branch

Do not work directly on `main`. Create a branch for your task.

```bash
git checkout -b feature/your-feature-name
```

### 3. Commit Changes

Make small, descriptive commits.

```bash
git add .
git commit -m "feat: add user profile page"
```

### 4. Push and Merge

Push your branch and open a Pull Request (PR) on GitHub.

```bash
git push -u origin feature/your-feature-name
```

## Directory Structure

- `the list tool/`: Next.js Application source code
- `docs/`: Documentation and project planning
- `database/`: Database schema and migrations
- `.agent/`: AI Agent workflows

## Notes

- **Large Files**: Avoid committing large binary files (videos, large datasets).
