module.exports = {
    apps: [
        {
            name: "linkifyme-backend",
            cwd: "./backend",
            script: "./venv/bin/uvicorn",
            args: "app.main:app --host 0.0.0.0 --port 8000",
            interpreter: "none",
            env: {
                PYTHONPATH: "."
            }
        },
        {
            name: "linkifyme-frontend",
            cwd: "./frontend",
            script: "npm",
            args: "start",
            env: {
                PORT: 3000,
                NODE_ENV: "production"
            }
        }
    ]
};
