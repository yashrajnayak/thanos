document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const formContainer = document.getElementById('form-container');
  const firstConfirm = document.getElementById('first-confirm');
  const secondConfirmOverlay = document.getElementById('second-confirm-overlay');
  const progressContainer = document.getElementById('progress-container');
  const resultContainer = document.getElementById('result-container');
  const successResult = document.getElementById('success-result');
  const errorResult = document.getElementById('error-result');
  
  const repoUrlInput = document.getElementById('repo-url');
  const tokenInput = document.getElementById('token');
  const submitBtn = document.getElementById('submit-btn');
  const confirmTextInput = document.getElementById('confirm-text');
  const confirmBtn = document.getElementById('confirm-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const finalConfirmBtn = document.getElementById('final-confirm-btn');
  const finalCancelBtn = document.getElementById('final-cancel-btn');
  const resetBtn = document.getElementById('reset-btn');
  
  // Deletion checkboxes
  const deleteFilesCheckbox = document.getElementById('delete-files');
  const deleteIssuesCheckbox = document.getElementById('delete-issues');
  const deleteReleasesCheckbox = document.getElementById('delete-releases');
  const deleteMilestonesCheckbox = document.getElementById('delete-milestones');
  const deleteLabelsCheckbox = document.getElementById('delete-labels');
  const createReadmeCheckbox = document.getElementById('create-readme');
  
  const deletionSummary = document.getElementById('deletion-summary');
  
  const progressIndicator = document.getElementById('progress-indicator');
  const progressPercentage = document.getElementById('progress-percentage');
  const currentOperation = document.getElementById('current-operation');
  const operationLogs = document.getElementById('operation-logs');
  const successSummaryList = document.getElementById('success-summary-list');
  const errorDetails = document.getElementById('error-details');
  
  // App State
  let repoInfo = {
    owner: '',
    repo: '',
    token: '',
    url: ''
  };
  
  let deletionOptions = {
    files: true,
    issues: true,
    releases: true,
    milestones: true,
    labels: true,
    createReadme: true
  };
  
  let resetStats = {
    filesDeleted: 0,
    issuesClosed: 0,
    releasesDeleted: 0,
    milestonesDeleted: 0,
    labelsDeleted: 0
  };
  
  // Event Listeners
  submitBtn.addEventListener('click', handleSubmit);
  confirmTextInput.addEventListener('input', validateConfirmText);
  confirmBtn.addEventListener('click', showSecondConfirmation);
  cancelBtn.addEventListener('click', resetForm);
  finalConfirmBtn.addEventListener('click', startRepositoryReset);
  finalCancelBtn.addEventListener('click', () => {
    secondConfirmOverlay.classList.add('hidden');
  });
  resetBtn.addEventListener('click', resetForm);
  
  // Add animation class to the submit button
  submitBtn.addEventListener('mouseenter', () => {
    submitBtn.querySelector('i').classList.add('fa-spin');
  });
  
  submitBtn.addEventListener('mouseleave', () => {
    submitBtn.querySelector('i').classList.remove('fa-spin');
  });
  
  // Update deletion options when checkboxes change
  deleteFilesCheckbox.addEventListener('change', () => {
    deletionOptions.files = deleteFilesCheckbox.checked;
  });
  
  deleteIssuesCheckbox.addEventListener('change', () => {
    deletionOptions.issues = deleteIssuesCheckbox.checked;
  });
  
  deleteReleasesCheckbox.addEventListener('change', () => {
    deletionOptions.releases = deleteReleasesCheckbox.checked;
  });
  
  deleteMilestonesCheckbox.addEventListener('change', () => {
    deletionOptions.milestones = deleteMilestonesCheckbox.checked;
  });
  
  deleteLabelsCheckbox.addEventListener('change', () => {
    deletionOptions.labels = deleteLabelsCheckbox.checked;
  });
  
  createReadmeCheckbox.addEventListener('change', () => {
    deletionOptions.createReadme = createReadmeCheckbox.checked;
  });
  
  // Functions
  function handleSubmit() {
    const repoUrl = repoUrlInput.value.trim();
    const token = tokenInput.value.trim();
    
    // Validate inputs
    if (!repoUrl || !token) {
      shakeElement(submitBtn);
      alert('Please enter both repository URL and GitHub token.');
      return;
    }
    
    // Check if at least one deletion option is selected
    if (!Object.values(deletionOptions).some(option => option === true)) {
      shakeElement(submitBtn);
      alert('Please select at least one component to delete.');
      return;
    }
    
    // Parse repository URL
    try {
      const url = new URL(repoUrl);
      if (url.hostname !== 'github.com') {
        throw new Error('Not a GitHub URL');
      }
      
      // Extract owner and repo from path
      const pathParts = url.pathname.split('/').filter(part => part.length > 0);
      if (pathParts.length < 2) {
        throw new Error('Invalid repository URL');
      }
      
      repoInfo.owner = pathParts[0];
      repoInfo.repo = pathParts[1];
      repoInfo.token = token;
      repoInfo.url = repoUrl;
      
      // Update the deletion summary for the confirmation screen
      updateDeletionSummary();
      
      // Show first confirmation with smooth transition
      formContainer.style.opacity = '0';
      formContainer.style.transform = 'translateY(-20px)';
      
      setTimeout(() => {
        formContainer.classList.add('hidden');
        firstConfirm.classList.remove('hidden');
        
        // Force reflow to ensure animation happens
        void firstConfirm.offsetWidth;
        
        firstConfirm.style.opacity = '1';
        firstConfirm.style.transform = 'translateY(0)';
      }, 300);
      
      // Update confirmation placeholder with repo name
      confirmTextInput.placeholder = repoInfo.repo;
      
    } catch (error) {
      shakeElement(submitBtn);
      alert('Please enter a valid GitHub repository URL (https://github.com/username/repository)');
    }
  }
  
  function updateDeletionSummary() {
    deletionSummary.innerHTML = '';
    
    // Create list items for each selected deletion option
    if (deletionOptions.files) {
      const li = document.createElement('li');
      li.innerHTML = '<i class="fas fa-folder"></i> Files and directories';
      deletionSummary.appendChild(li);
    }
    
    if (deletionOptions.issues) {
      const li = document.createElement('li');
      li.innerHTML = '<i class="fas fa-exclamation-circle"></i> Issues and pull requests';
      deletionSummary.appendChild(li);
    }
    
    if (deletionOptions.releases) {
      const li = document.createElement('li');
      li.innerHTML = '<i class="fas fa-tag"></i> Releases';
      deletionSummary.appendChild(li);
    }
    
    if (deletionOptions.milestones) {
      const li = document.createElement('li');
      li.innerHTML = '<i class="fas fa-flag"></i> Milestones';
      deletionSummary.appendChild(li);
    }
    
    if (deletionOptions.labels) {
      const li = document.createElement('li');
      li.innerHTML = '<i class="fas fa-tags"></i> Issue labels';
      deletionSummary.appendChild(li);
    }
  }
  
  function validateConfirmText() {
    if (confirmTextInput.value.trim() === repoInfo.repo) {
      confirmBtn.disabled = false;
      confirmBtn.classList.add('btn-pulse');
      setTimeout(() => confirmBtn.classList.remove('btn-pulse'), 600);
    } else {
      confirmBtn.disabled = true;
    }
  }
  
  function showSecondConfirmation() {
    secondConfirmOverlay.classList.remove('hidden');
    
    // Add a slight delay to ensure the animation plays
    setTimeout(() => {
      const modal = document.getElementById('second-confirm');
      modal.classList.add('modal-active');
    }, 10);
  }
  
  function resetForm() {
    // Apply exit animations
    if (!formContainer.classList.contains('hidden')) {
      formContainer.style.opacity = '0';
      formContainer.style.transform = 'translateY(-20px)';
    }
    
    if (!firstConfirm.classList.contains('hidden')) {
      firstConfirm.style.opacity = '0';
      firstConfirm.style.transform = 'translateY(-20px)';
    }
    
    if (!secondConfirmOverlay.classList.contains('hidden')) {
      secondConfirmOverlay.style.opacity = '0';
    }
    
    if (!progressContainer.classList.contains('hidden')) {
      progressContainer.style.opacity = '0';
      progressContainer.style.transform = 'translateY(-20px)';
    }
    
    if (!resultContainer.classList.contains('hidden')) {
      resultContainer.style.opacity = '0';
      resultContainer.style.transform = 'translateY(-20px)';
    }
    
    // Reset UI after animations complete
    setTimeout(() => {
      // Reset UI
      formContainer.classList.remove('hidden');
      firstConfirm.classList.add('hidden');
      secondConfirmOverlay.classList.add('hidden');
      progressContainer.classList.add('hidden');
      resultContainer.classList.add('hidden');
      successResult.classList.add('hidden');
      errorResult.classList.add('hidden');
      
      // Apply entrance animations
      formContainer.style.opacity = '';
      formContainer.style.transform = '';
      firstConfirm.style.opacity = '';
      firstConfirm.style.transform = '';
      secondConfirmOverlay.style.opacity = '';
      progressContainer.style.opacity = '';
      progressContainer.style.transform = '';
      resultContainer.style.opacity = '';
      resultContainer.style.transform = '';
      
      // Reset inputs
      repoUrlInput.value = '';
      tokenInput.value = '';
      confirmTextInput.value = '';
      confirmBtn.disabled = true;
      
      // Reset checkboxes
      deleteFilesCheckbox.checked = true;
      deleteIssuesCheckbox.checked = true;
      deleteReleasesCheckbox.checked = true;
      deleteMilestonesCheckbox.checked = true;
      deleteLabelsCheckbox.checked = true;
      createReadmeCheckbox.checked = true;
      
      // Reset deletion options
      deletionOptions = {
        files: true,
        issues: true,
        releases: true,
        milestones: true,
        labels: true,
        createReadme: true
      };
      
      // Reset progress
      progressIndicator.style.width = '0%';
      progressPercentage.textContent = '0%';
      currentOperation.textContent = 'Preparing...';
      operationLogs.innerHTML = '';
      
      // Reset stats
      resetStats = {
        filesDeleted: 0,
        issuesClosed: 0,
        releasesDeleted: 0,
        milestonesDeleted: 0,
        labelsDeleted: 0
      };
      
    }, 300);
  }
  
  // GitHub API functions
  async function startRepositoryReset() {
    try {
      secondConfirmOverlay.classList.add('hidden');
      firstConfirm.classList.add('hidden');
      progressContainer.classList.remove('hidden');
      
      logOperation('Starting repository reset process...', 'normal');
      updateProgress(5, 'Initializing...');
      
      // Add typewriter effect to the operation text
      currentOperation.dataset.text = 'Initializing...';
      typeWriter(currentOperation, 0, 50);
      
      // Perform operations sequentially based on selected options
      await validateAccess();
      await sleep(300); // Add slight delay for visual effect
      updateProgress(10, 'Validated access. Fetching repository data...');
      
      const repoData = await fetchRepositoryData();
      await sleep(300);
      updateProgress(15, 'Repository data fetched. Starting cleanup...');
      
      // Calculate total operations for progress tracking
      const totalOperations = Object.values(deletionOptions).filter(op => op).length;
      let completedOperations = 0;
      const progressStep = 85 / totalOperations; // 85% of progress bar (15-100%)
      
      // Perform selected operations
      if (deletionOptions.issues) {
        await closeIssues();
        await sleep(200);
        completedOperations++;
        updateProgress(15 + (completedOperations * progressStep), 'Issues closed.');
      }
      
      if (deletionOptions.releases) {
        await deleteReleases();
        await sleep(200);
        completedOperations++;
        updateProgress(15 + (completedOperations * progressStep), 'Releases deleted.');
      }
      
      if (deletionOptions.milestones) {
        await deleteMilestones();
        await sleep(200);
        completedOperations++;
        updateProgress(15 + (completedOperations * progressStep), 'Milestones deleted.');
      }
      
      if (deletionOptions.labels) {
        await deleteLabels();
        await sleep(200);
        completedOperations++;
        updateProgress(15 + (completedOperations * progressStep), 'Labels deleted.');
      }
      
      if (deletionOptions.files) {
        await deleteFiles(repoData);
        await sleep(200);
        completedOperations++;
        updateProgress(15 + (completedOperations * progressStep), 'Files deleted.');
        
        // Create README.md only if option is selected
        if (deletionOptions.createReadme) {
          await createReadme();
        }
      }
      
      await sleep(300);
      updateProgress(100, 'Reset complete!');
      
      // Add a slight delay before showing success screen for better UX
      setTimeout(() => {
        showSuccessResult();
      }, 800);
      
    } catch (error) {
      logOperation(`Error: ${error.message}`, 'error');
      showErrorResult(error);
    }
  }
  
  async function makeGitHubRequest(endpoint, method = 'GET', data = null) {
    const url = `https://api.github.com${endpoint}`;
    const options = {
      method,
      headers: {
        'Authorization': `token ${repoInfo.token}`, // Changed back to original format for fine-grained tokens
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP Error: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      if (response.status === 204) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error (${url}):`, error);
      throw error;
    }
  }
  
  async function validateAccess() {
    try {
      logOperation('Validating repository access...', 'normal');
      const response = await makeGitHubRequest(`/repos/${repoInfo.owner}/${repoInfo.repo}`);
      
      // Check required permissions based on selected options
      const missingPermissions = [];
      
      if (!response.permissions) {
        throw new Error('Could not verify token permissions. Please check if the token is valid.');
      }

      // For files, check either 'push' or 'contents' permission
      if (deletionOptions.files && !response.permissions.push && !response.permissions.contents) {
        missingPermissions.push('contents (write) or repository (write)');
      }
      
      // For issues, milestones, and labels, check either 'admin' or 'issues' permission
      if ((deletionOptions.issues || deletionOptions.milestones || deletionOptions.labels) && 
          !response.permissions.admin && !response.permissions.issues) {
        missingPermissions.push('issues (write)');
      }
      
      // For releases, check either 'push', 'contents', or 'admin' permission
      if (deletionOptions.releases && 
          !response.permissions.push && !response.permissions.contents && !response.permissions.admin) {
        missingPermissions.push('contents (write) or repository (write)');
      }
      
      if (missingPermissions.length > 0) {
        throw new Error(`Insufficient permissions. Token must have the following permissions: ${missingPermissions.join(', ')}`);
      }
      
      logOperation('✓ Access validated', 'success');
    } catch (error) {
      logOperation(`✗ Access validation failed: ${error.message}`, 'error');
      throw error;
    }
  }
  
  async function fetchRepositoryData() {
    try {
      logOperation('Fetching repository data...', 'normal');
      const response = await makeGitHubRequest(`/repos/${repoInfo.owner}/${repoInfo.repo}`);
      logOperation('✓ Repository data fetched', 'success');
      return response;
    } catch (error) {
      logOperation(`✗ Failed to fetch repository data: ${error.message}`, 'error');
      throw error;
    }
  }
  
  async function closeIssues() {
    try {
      logOperation('Fetching open issues and pull requests...', 'normal');
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const issues = await makeGitHubRequest(
          `/repos/${repoInfo.owner}/${repoInfo.repo}/issues?state=open&per_page=100&page=${page}`
        );
        
        if (issues.length === 0) {
          hasMore = false;
          continue;
        }
        
        logOperation(`Closing ${issues.length} issues/pull requests on page ${page}...`, 'normal');
        
        for (const issue of issues) {
          await makeGitHubRequest(
            `/repos/${repoInfo.owner}/${repoInfo.repo}/issues/${issue.number}`,
            'PATCH',
            { state: 'closed' }
          );
          resetStats.issuesClosed++;
        }
        
        page++;
      }
      
      logOperation(`✓ Closed ${resetStats.issuesClosed} issues and pull requests`, 'success');
    } catch (error) {
      logOperation(`✗ Error closing issues: ${error.message}`, 'error');
      throw error;
    }
  }
  
  async function deleteReleases() {
    try {
      logOperation('Fetching releases...', 'normal');
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const releases = await makeGitHubRequest(
          `/repos/${repoInfo.owner}/${repoInfo.repo}/releases?per_page=100&page=${page}`
        );
        
        if (releases.length === 0) {
          hasMore = false;
          continue;
        }
        
        logOperation(`Deleting ${releases.length} releases on page ${page}...`, 'normal');
        
        for (const release of releases) {
          await makeGitHubRequest(
            `/repos/${repoInfo.owner}/${repoInfo.repo}/releases/${release.id}`,
            'DELETE'
          );
          resetStats.releasesDeleted++;
        }
        
        page++;
      }
      
      logOperation(`✓ Deleted ${resetStats.releasesDeleted} releases`, 'success');
    } catch (error) {
      logOperation(`✗ Error deleting releases: ${error.message}`, 'error');
      throw error;
    }
  }
  
  async function deleteMilestones() {
    try {
      logOperation('Fetching milestones...', 'normal');
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const milestones = await makeGitHubRequest(
          `/repos/${repoInfo.owner}/${repoInfo.repo}/milestones?state=open&per_page=100&page=${page}`
        );
        
        if (milestones.length === 0) {
          hasMore = false;
          continue;
        }
        
        logOperation(`Deleting ${milestones.length} milestones on page ${page}...`, 'normal');
        
        for (const milestone of milestones) {
          await makeGitHubRequest(
            `/repos/${repoInfo.owner}/${repoInfo.repo}/milestones/${milestone.number}`,
            'DELETE'
          );
          resetStats.milestonesDeleted++;
        }
        
        page++;
      }
      
      logOperation(`✓ Deleted ${resetStats.milestonesDeleted} milestones`, 'success');
    } catch (error) {
      logOperation(`✗ Error deleting milestones: ${error.message}`, 'error');
      throw error;
    }
  }
  
  async function deleteLabels() {
    try {
      logOperation('Fetching issue labels...', 'normal');
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const labels = await makeGitHubRequest(
          `/repos/${repoInfo.owner}/${repoInfo.repo}/labels?per_page=100&page=${page}`
        );
        
        if (labels.length === 0) {
          hasMore = false;
          continue;
        }
        
        logOperation(`Deleting ${labels.length} issue labels on page ${page}...`, 'normal');
        
        for (const label of labels) {
          await makeGitHubRequest(
            `/repos/${repoInfo.owner}/${repoInfo.repo}/labels/${encodeURIComponent(label.name)}`,
            'DELETE'
          );
          resetStats.labelsDeleted++;
        }
        
        page++;
      }
      
      logOperation(`✓ Deleted ${resetStats.labelsDeleted} issue labels`, 'success');
    } catch (error) {
      logOperation(`✗ Error deleting issue labels: ${error.message}`, 'error');
      throw error;
    }
  }
  
  async function deleteFiles(repoData) {
    try {
      logOperation('Fetching repository contents...', 'normal');
      const defaultBranch = repoData.default_branch;
      
      // Get current commit SHA
      const reference = await makeGitHubRequest(
        `/repos/${repoInfo.owner}/${repoInfo.repo}/git/ref/heads/${defaultBranch}`
      );
      const currentCommitSha = reference.object.sha;
      updateProgress(60, 'Got current commit reference...');
      
      // Get current tree
      const currentCommit = await makeGitHubRequest(
        `/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits/${currentCommitSha}`
      );
      const currentTreeSha = currentCommit.tree.sha;
      updateProgress(65, 'Analyzed current repository tree...');
      
      // Create empty tree
      logOperation('Creating empty tree...', 'normal');
      const emptyTree = await makeGitHubRequest(
        `/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees`,
        'POST',
        { tree: [] }
      );
      updateProgress(70, 'Created empty tree...');
      
      // Create commit with empty tree
      logOperation('Creating commit with empty tree...', 'normal');
      const newCommit = await makeGitHubRequest(
        `/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits`,
        'POST',
        {
          message: 'Repository reset: Delete all files',
          tree: emptyTree.sha,
          parents: [currentCommitSha]
        }
      );
      updateProgress(80, 'Created commit with empty tree...');
      
      // Update branch reference
      logOperation(`Updating ${defaultBranch} branch to empty commit...`, 'normal');
      await makeGitHubRequest(
        `/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs/heads/${defaultBranch}`,
        'PATCH',
        { sha: newCommit.sha, force: true }
      );
      updateProgress(90, 'Updated branch reference...');
      
      logOperation('✓ All files deleted', 'success');
      resetStats.filesDeleted = 1; // Just to indicate files were deleted
    } catch (error) {
      logOperation(`✗ Error deleting files: ${error.message}`, 'error');
      throw error;
    }
  }
  
  async function createReadme() {
    try {
      logOperation('Creating README.md file...', 'normal');
      
      const readmeContent = `# ${repoInfo.repo} 🧹
      
## Repository Reset ✨

This repository has been reset using Thanos 💪, the GitHub Repository Reset Tool.

The repository is now in a clean state, ready for new commits and contributions.

## What was deleted 🗑️

${deletionOptions.files ? '- All files and directories\n- Commit history\n' : ''}${deletionOptions.issues ? '- Issues and pull requests\n' : ''}${deletionOptions.releases ? '- Releases\n' : ''}${deletionOptions.milestones ? '- Milestones\n' : ''}${deletionOptions.labels ? '- Issue labels\n' : ''}

## Next Steps 🚀

You can now start adding new files to this repository!

Happy coding! 💻
`;
      
      const encodedContent = btoa(readmeContent);
      
      await makeGitHubRequest(
        `/repos/${repoInfo.owner}/${repoInfo.repo}/contents/README.md`,
        'PUT',
        {
          message: 'Create README.md after repository reset',
          content: encodedContent
        }
      );
      
      logOperation('✓ README.md created', 'success');
    } catch (error) {
      logOperation(`✗ Error creating README.md: ${error.message}`, 'error');
      throw error;
    }
  }
  
  // UI Helper Functions
  function updateProgress(percent, message) {
    // Animate progress bar
    progressIndicator.style.width = `${percent}%`;
    progressPercentage.textContent = `${percent}%`;
    
    // Update operation text with typewriter effect
    if (currentOperation.textContent !== message) {
      currentOperation.dataset.text = message;
      typeWriter(currentOperation, 0, 30);
    }
  }
  
  function typeWriter(element, index, speed) {
    const text = element.dataset.text;
    
    // Check if text is defined to avoid null error
    if (!text) {
      console.error('No text found for typewriter effect');
      element.textContent = element.textContent || '';
      return;
    }
    
    if (index < text.length) {
      element.textContent = text.substring(0, index + 1);
      setTimeout(() => typeWriter(element, index + 1, speed), speed);
    }
  }
  
  function logOperation(message, type = 'normal') {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = message;
    
    // Add fade-in effect
    logEntry.style.opacity = '0';
    operationLogs.appendChild(logEntry);
    
    // Force reflow
    void logEntry.offsetWidth;
    
    // Fade in
    logEntry.style.opacity = '1';
    
    // Auto-scroll to bottom
    operationLogs.scrollTop = operationLogs.scrollHeight;
  }
  
  function showSuccessResult() {
    // Fade out progress container
    progressContainer.style.opacity = '0';
    progressContainer.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
      progressContainer.classList.add('hidden');
      resultContainer.classList.remove('hidden');
      successResult.classList.remove('hidden');
      
      // Fade in result container
      resultContainer.style.opacity = '1';
      resultContainer.style.transform = 'translateY(0)';
      
      // Populate summary with animation
      successSummaryList.innerHTML = '';
      
      const summaryItems = [
        `Repository reset: ${repoInfo.owner}/${repoInfo.repo}`
      ];
      
      if (deletionOptions.files) {
        summaryItems.push('All files and directories deleted');
      }
      
      if (deletionOptions.issues) {
        summaryItems.push(`${resetStats.issuesClosed} issues and pull requests closed`);
      }
      
      if (deletionOptions.releases) {
        summaryItems.push(`${resetStats.releasesDeleted} releases deleted`);
      }
      
      if (deletionOptions.milestones) {
        summaryItems.push(`${resetStats.milestonesDeleted} milestones deleted`);
      }
      
      if (deletionOptions.labels) {
        summaryItems.push(`${resetStats.labelsDeleted} issue labels deleted`);
      }
      
      if (deletionOptions.files && deletionOptions.createReadme) {
        summaryItems.push('README.md file created');
      }
      
      summaryItems.forEach((item, index) => {
        setTimeout(() => {
          const li = document.createElement('li');
          li.textContent = item;
          li.style.opacity = '0';
          li.style.transform = 'translateX(-10px)';
          successSummaryList.appendChild(li);
          
          // Force reflow
          void li.offsetWidth;
          
          // Animate in
          li.style.opacity = '1';
          li.style.transform = 'translateX(0)';
        }, index * 150);
      });
    }, 300);
  }
  
  function showErrorResult(error) {
    // Fade out progress container
    progressContainer.style.opacity = '0';
    progressContainer.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
      progressContainer.classList.add('hidden');
      resultContainer.classList.remove('hidden');
      errorResult.classList.remove('hidden');
      
      // Fade in result container
      resultContainer.style.opacity = '1';
      resultContainer.style.transform = 'translateY(0)';
      
      errorDetails.textContent = error.stack || error.message || 'Unknown error occurred';
      
      // Add typing effect to error
      typeWriter(errorDetails, 0, 5);
    }, 300);
  }
  
  // Utility functions
  function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 500);
  }
  
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Add CSS for new animations
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    .shake {
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
    
    @keyframes shake {
      10%, 90% { transform: translateX(-1px); }
      20%, 80% { transform: translateX(2px); }
      30%, 50%, 70% { transform: translateX(-4px); }
      40%, 60% { transform: translateX(4px); }
    }
    
    .btn-pulse {
      animation: pulse 0.6s ease-out;
    }
    
    #first-confirm, #second-confirm, #progress-container, #result-container {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    #form-container {
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .log-entry {
      transition: opacity 0.3s ease;
    }
    
    .modal-active {
      animation: zoom-in 0.3s ease-out forwards;
    }
    
    @keyframes zoom-in {
      0% { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    
    #success-summary-list li {
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
  `;
  document.head.appendChild(styleSheet);
});