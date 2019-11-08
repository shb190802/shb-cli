#!/usr/bin/env node

const commander = require('commander')
const program = new commander.Command()
const Project = require('../src/project')
const package = require('../package.json')

program
  .version(package.version)
  .option('-n, --name[name]','项目名称')
  .option('-d, --desc[desc]','项目介绍')
  .parse(process.argv)

const {name,desc} = program
const args = program.args

const projectName = args[0] || name

const project = new Project({
  projectName,
  projectDesc: desc
})

project.create()