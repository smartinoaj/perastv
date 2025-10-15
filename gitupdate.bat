@echo off
:: This script automates the process of committing and pushing changes to your Git repository.

echo ===================================
echo  WEBSITE UPDATE SCRIPT
echo ===================================
echo.

:: Add all new and modified files to the staging area.
echo [1/3] Staging all changes...
git add .
echo.

:: Prompt the user for a commit message.
echo [2/3] Please enter a commit message (e.g., "Updated links on software page"):
set /p commitMessage="Commit Message: "
echo.

:: Commit the changes with the provided message.
echo Committing with message: "%commitMessage%"
git commit -m "%commitMessage%"
echo.

:: Push the changes to the remote repository.
echo [3/3] Pushing changes to the remote server...
git push
echo.

echo ===================================
echo  UPDATE COMPLETE!
echo ===================================
echo.
pause