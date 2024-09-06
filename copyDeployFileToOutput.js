import * as fs from 'fs'

const copyDeployFileToOutput = () => {
  const sourcePath = './deploy'
  const outputPath = './.output'

  const files = fs.readdirSync(sourcePath)
  files.forEach((file) => {
    fs.copyFileSync(`${sourcePath}/${file}`, `${outputPath}/${file}`)
  })
}

copyDeployFileToOutput()
