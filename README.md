# Thanos 💀 - GitHub Repository Reset Tool

Thanos is a powerful web-based tool that lets you completely reset a GitHub repository by removing all files, directories, commit history, issues, pull requests, releases, milestones, and issue labels in one go. The tool allows you to selectively choose which components to delete. Use with extreme caution as the actions performed are irreversible.

> *"I am inevitable"* - Thanos

![image](https://github.com/user-attachments/assets/c6e855eb-1325-494f-b3fa-541c352ae2c0)

## 💻 Features

- 🔐 **Secure Authentication** - Uses GitHub Personal Access Token with fine-grained permissions
- ✅ **Double Confirmation** - Requires two separate confirmations to prevent accidental deletions
- 🎯 **Selective Reset** - Choose which components to delete:
  - Files and directories
  - Commit history
  - Issues and pull requests
  - Releases
  - Milestones
  - Issue labels
- 📊 **Progress Tracking** - Real-time progress updates during the reset process
- 📝 **Operation Logs** - Detailed logs of all operations performed
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Beautiful Dark UI** - Modern interface with animations and visual feedback

## ⚠️ Warning

**THIS TOOL PERMANENTLY DELETES DATA. THERE IS NO WAY TO RECOVER DELETED CONTENT.**

Use only on repositories that you own and want to completely reset. Always make a backup before using this tool if there's any chance you might need the content later.

## 🔧 How to Use

1. Open the tool in your web browser
2. Enter your GitHub repository URL (e.g., https://github.com/username/repository)
3. Enter your GitHub Personal Access Token with appropriate permissions
4. Select which components you want to delete (files, issues, releases, milestones, labels)
5. Follow the confirmation prompts
6. Wait for the reset process to complete

## 🛡️ Required Token Permissions

Your Personal Access Token needs these permissions:
- `repo` (Full control of private repositories)
- `delete_repo` (Delete repositories)
- `issues` (Issues access)
- `workflow` (Workflow access)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/thanos.git
cd thanos
```

### 2. Open the application
Open `index.html` in your web browser or host the files on a web server.

### 3. Create a Personal Access Token
1. Go to your GitHub Settings > Developer settings > [Personal access tokens](https://github.com/settings/tokens) > Fine-grained tokens
2. Generate a new token with the required permissions listed above
3. Save the token securely - you'll need it to use Thanos

## 🔒 Security Note

This application runs entirely on the client side. Your GitHub token is never stored on any server and is only used to make API calls directly from your browser to GitHub.

## 🧠 How It Works

Thanos uses the GitHub REST API to:
1. Validate your access to the repository
2. Close all open issues and pull requests (if selected)
3. Delete all releases and their assets (if selected)
4. Delete all milestones (if selected)
5. Delete all issue labels (if selected)
6. Create an empty Git tree and commit (if file deletion is selected)
7. Force push this empty tree to the repository's default branch
8. Create a new README.md file with details of what was deleted

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚖️ Disclaimer

This tool is provided for educational purposes only. The authors are not responsible for any data loss or damages resulting from the use of this tool.

Use responsibly!

---

*Created with ❤️ by a developer who knows the value of a fresh start.*
