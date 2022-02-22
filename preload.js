const { contextBridge, ipcRenderer } = require('electron')

// Setup interprocess communication between the javascript rendering the frontend and the main process.
contextBridge.exposeInMainWorld("api", {
    send: ( channel, data ) => ipcRenderer.invoke( channel, data ),
    handle: ( channel, callable, event, data ) => ipcRenderer.on( channel, callable( event, data ) )
} )

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type])
    }
  })

