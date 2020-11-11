const execSync = require("child_process").execSync;

function run(command) {
  console.log(command);
  execSync(command, {stdio: 'inherit'});
}

const mysqlVersion = parseFloat(process.env['INPUT_MYSQL-VERSION'] || '8.0').toFixed(1);

if (!['8.0', '5.7', '5.6'].includes(mysqlVersion)) {
  throw `MySQL version not supported: ${mysqlVersion}`;
}

if (process.platform == 'darwin') {
  // install
  run(`brew install mysql@${mysqlVersion}`);

  // start
  const bin = `/usr/local/opt/mysql@${mysqlVersion}/bin`;
  run(`${bin}/mysql.server start`);

  // set path
  run(`echo "${bin}" >> $GITHUB_PATH`);
} else {
  if (mysqlVersion != '8.0') {
    // remove previous version
    run(`sudo apt-get purge mysql*`);
    run(`sudo rm -r /var/lib/mysql`);

    // install new version
    run(`sudo apt-get install mysql-server-${mysqlVersion}`);
  }

  // start
  run('sudo service mysql start');

  // remove root password
  run(`sudo mysqladmin -proot password ''`);

  // add user
  run(`sudo mysql -e "CREATE USER '$USER'@'localhost' IDENTIFIED BY ''"`);
  run(`sudo mysql -e "GRANT ALL PRIVILEGES ON *.* TO '$USER'@'localhost'"`);
  run(`sudo mysql -e "FLUSH PRIVILEGES"`);
}
