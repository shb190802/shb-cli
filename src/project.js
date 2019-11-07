const inquirer = require('inquirer')
const fse = require('fs-extra')
const ora = require('ora')
const path = require('path')
const download = require('download-git-repo')
const {GIT_REPO} = require('./config')
const chalk = require('chalk')
const { exec } = require('child_process')

class Project{
  constructor(options) {
    this.options = Object.assign({
      projectName: '',
      projectDesc: ''
    },options)
  }

  create(){
    console.log('start create project')
    this.inquirer()
      .then((res) => {
        this.options = Object.assign(this.options,res)
        this.initProject()
      })
  }

  inquirer(){
    let prompts = []
    const {projectName,projectDesc} = this.options
    if(typeof projectName !== 'string') {
      prompts.push({
        type: 'input',
        name: 'projectName',
        message: '请输入项目名',
        validate(input) {
          if(!input) {
            return '项目名称不能为空'
          }else if(fse.existsSync(input)) {
            return '该目录已经有同名项目，请更换项目名称！'
          }
          return true
        }
      })
    }else if(fse.existsSync(projectName)) {
      prompts.push({
        type: 'input',
        name: 'projectName',
        message: '该目录已存在同名项目，请更换项目名',
        validate(input) {
          if(!input) {
            return '项目名称不能为空'
          }else if(fse.existsSync(input)) {
            return '该目录已经有同名项目，请更换项目名称！'
          }
          return true
        }
      })
    }
    return inquirer.prompt(prompts)
  }

  initProject(){
    const {projectName,projectDesc} = this.options
    const projectPath = path.join(process.cwd(),projectName)
    const tempPath = path.join(projectPath,'__temp__')

    const downloadSpinner = ora('正在下载模板，请稍后...')
    downloadSpinner.start()
    download(GIT_REPO,tempPath,{clone: true},async (err) => {
      if(err) {
        downloadSpinner.color = 'red'
        downloadSpinner.fail(err.message)
        return
      }
      downloadSpinner.color = 'green'
      downloadSpinner.succeed('下载成功')

      const files = fse.readdirSync(tempPath)
      files.forEach(file => {
        fse.copySync(path.join(tempPath,file),path.join(projectPath,file))
        console.log(chalk.green(`创建${file}成功！`))
      });
      fse.remove(tempPath)

      process.chdir(projectPath)
      console.log()
      console.log(chalk.green(`cd ${projectName}`))
      if(await doExec('git init') && await doExec('npm install')){
        console.log(chalk.green('项目构建成功！'))
        process.exit()
      }
    })
  }
}
function doExec(cmd,msg){
  msg = msg || cmd
  return new Promise((resolve) => {
    let spinner = ora(chalk.green(msg))
    spinner.start()
    let executor = exec(cmd)
    executor.on('close',code => {
      if(code === 0) {
        spinner.color = 'green'
        spinner.succeed(executor.stdout.read())
        resolve(true)
      }else {
        spinner.color = 'red'
        spinner.fail(executor.stderr.read())
        resolve(false)
      }
    })
  })
}
module.exports = Project