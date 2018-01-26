git fetch origin
git checkout -b settings origin/settings
git merge master

git checkout master
git merge --no-ff settings
git push origin master