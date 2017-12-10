const vfile = require('to-vfile');
const path = require('path');
const glob = require('glob');
const report = require('vfile-reporter');
const remark = require('remark');
const validateLinks = require('remark-validate-links');
const noDeadUrls = require('remark-lint-no-dead-urls');
const ProgressBar = require('progress');

const numParallelPromises = 8;

function getMdFilePaths() {
  return new Promise(function (resolve, reject) {
    glob('{,!(node_modules)/**/}*.md', {}, function (err, files) {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

function lintMd(fileContent, bar) {
  return new Promise(function (resolve) {
    const linter = remark().use(validateLinks).use(noDeadUrls);

    linter.process(fileContent, function (err, file) {
      bar.tick();

      if (Boolean(err) || file.messages.length > 0) {
        bar.interrupt(report(err || file));
      }

      resolve();
    })
  });
}

getMdFilePaths().then(function (mdPaths) {
  const bar = new ProgressBar(':current / :total [:bar]', {
    total: mdPaths.length,
    width: 40,
    clear: true
  });
  let filePaths = mdPaths.concat();
  let promiseChain = Promise.resolve();

  while (filePaths.length > 0) {
    const filesToLint = 
      filePaths
        .splice(0, numParallelPromises)
        .map(function (filePath) {
          return vfile.readSync(filePath);
        });

    promiseChain = promiseChain.then(function () {
      return Promise.all(filesToLint.map(function(file) {
        return lintMd(file, bar);
      }))
    })
  }
}).catch(function (err) {
  console.error(err);
});