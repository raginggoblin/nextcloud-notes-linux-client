'use strict'

const {app, BrowserWindow, ipcMain, protocol, webContents} = require('electron')
const url		= require( 'url' ) 
const path		= require( 'path' )
const dialog	= require( 'electron' ).dialog
const Store		= require( 'electron-store' )
const log		= require( 'electron-log' )

const marked 			= require( 'marked' )
const removeMarkdown	= require( 'remove-markdown' )

let win,
	loginFlow,
	prefs = null,
	willQuit = false

let store = new Store({
	name: 'config',
	defaults: {
		
		windowBounds: {
			
			width: 1000,
			height: 680,
			x: 0,
			y: 0
		},
		
		loginCredentials: {
			
			server: '',
			username: '',
			password: ''
		},
		
		appInterface: {
			
			sidebar: null,
			selected: null,
			categories: true
		},
		
		appSettings: {
			
			sortby: 'modified',
			orderby: 'desc',
			zoom: '10',
			cursor: 'start',
			spellcheck: true,
			showcats: true,
			ordercats: 'asc',
			catcount: false,
			nocertificate: false,
			stopwords: false,
			stemming: false,
			editing: false
		},
		
		categories: {
			
			selected: '##all##',
			list: null
		},
		
		exportPath: app.getPath('desktop')
	}
})



function createWindow() {
	
	let { x, y, width, height } = store.get('windowBounds')
	
	win = new BrowserWindow({
		show: false,
		x: x,
		y: y,
		width: width,
		height: height,
		minWidth: 800,
		minHeight: 372,
		title: '',
		vibrancy: 'sidebar',
		webPreferences: {
			devTools: true,
			preload: path.join(__dirname, './preload.min.js'),
			nodeIntegration: true,
			spellcheck: true
		}
	})

	win.setIcon(path.join(__dirname, '../assets/icon/icon.png'))
	
	function saveWindowBounds() {
		
		store.set('windowBounds', win.getBounds())
	}
	
	win.loadURL(url.format ({ 
		
		pathname: path.join(__dirname, '../html/app.html'), 
		protocol: 'file:', 
		slashes: true 
	}))
	
	win.once('ready-to-show', () => {
		
		win.show()
	})
	
	win.on('resize', saveWindowBounds)
	win.on('move', saveWindowBounds)

	win.on('blur', () => {
		
		win.setVibrancy( 'window' )
	})
	
	win.on('focus', () => {
		
		win.setVibrancy( 'sidebar' )
	})
	
	win.on('close', (e) => {
		
		if(willQuit === false) {
			e.preventDefault()
			win.webContents.send('before-quit', '')
			
			willQuit = true
		}
	})
	
	win.webContents.on('did-fail-load', () => {
    	
		log.error( `main window did not load` )
	})
	
	win.webContents.on( 'crashed', ( event, killed ) => {
		
		log.info( `main window has crashed:` )
		log.error( event )
	})
	
	win.on( 'unresponsive', () => {
		
		log.info( `main window is not responding…` )
	})
	
	win.on( 'responsive', () => {
		
		log.info( `main window is responding` )
	})
	
	protocol.registerFileProtocol('nc', (request) => {
		
		if( request.url ) {
		
			const url = request.url.split( '&' )
			
			const 	user = url[1].replace('user:', ''),
					pass = url[2].replace('password:', '')
			
			store.set( 'loginCredentials.username', user )
			store.set( 'loginCredentials.password', pass )
			
			loginFlow.close()
			
			win.webContents.send('close-login-modal', 'close-login-modal')
			win.webContents.send('reload-sidebar', 'login')
			
		} else {
			
			log.error('Failed to register nc protocol')
		}
	})
	
	require( './menu-app.min' )
	require( './menu-sidebar.min' )
	require( './menu-notes.min' )
}

app.on('ready', createWindow)



app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
	
	if( store.get('appSettings.nocertificate') ) {
		
		log.info(`certificate ignored`)
		event.preventDefault()
		callback(true)
		
	} else {
		
		const i18n = require( './i18n.min' )
		
		log.error(error)
		callback(false)
		let server = store.get( 'loginCredentials.server' )
		
		dialog.showErrorBox(
			i18n.t('main:dialog.error.cert.title', 'Your connection is not private'),
			`${error}\n\n` +
			i18n.t('main:dialog.error.cert.text', {server: server})
		)
	}
})



process.on('uncaughtException', (err, origin) => {
	
	log.error(`caught exception: ${err}`)
	log.info(`exception origin: ${origin}`)
})



ipcMain.on('loginflow', (event, message) => {
	
	loginFlow = new BrowserWindow({
		
		width: 800,
		height: 600,
		resizable: false,
		minimizable: false,
		maximizable: false,
		show: false,
		titleBarStyle: 'hidden',
		backgroundColor: '#0082c9',
		webPreferences: {
			devTools: true,
			nodeIntegration: false
		}
	})
	
	loginFlow.loadURL( message + '/index.php/login/flow' , {
		
		userAgent: 'Nextcloud Notes Client - Macintosh',
		extraHeaders: 'OCS-APIRequest: true'
	})
	
	loginFlow.once('ready-to-show', () => {
		
		loginFlow.show()
	})
	
	loginFlow.webContents.on('did-fail-load', () => {
		
		log.error( `loginflow window did not load` )
	})
	
	loginFlow.webContents.on( 'crashed', ( event, killed ) => {
		
		log.info( `loginflow window has crashed:` )
		log.error( event )
	})
	
	loginFlow.on( 'unresponsive', () => {
		
		log.info( `loginflow window is not responding…` )
	})
	
	loginFlow.on( 'responsive', () => {
		
		log.info( `loginflow window is responding` )
	})
})



app.on('open-prefs', () => {
	
	if( prefs === null ) {
		
		prefs = new BrowserWindow({
			
			width: 548,
			height: 454,
			resizable: false,
			minimizable: false,
			maximizable: false,
			show: false,
			vibrancy: 'under-window',
			webPreferences: {
				devTools: true,
				preload: path.join(__dirname, './preload.min.js'),
				nodeIntegration: true
			},
		})
		
		prefs.loadURL(url.format ({ 
			
			pathname: path.join(__dirname, '../html/prefs.html'), 
			protocol: 'file:', 
			slashes: true 
		}))
		
		prefs.once('ready-to-show', () => {
			
			prefs.show()
		})
		
		prefs.webContents.on('did-fail-load', () => {
			
			log.error( `prefs window did not load` )
		})
		
		prefs.webContents.on( 'crashed', ( event, killed ) => {
			
			log.info( `prefs window has crashed:` )
			log.error( event )
		})
		
		prefs.on( 'unresponsive', () => {
			
			log.info( `prefs window is not responding…` )
		})
		
		prefs.on( 'responsive', () => {
			
			log.info( `prefs window is responding` )
		})
		
		prefs.on('close', () => {
			prefs = null
		})
	}
})



 ipcMain.on('quit-app', (event, message) => {
	 
	 if( willQuit ) app.quit()
 })
 
 

ipcMain.on('update-titlebar', (event, message) => {
	
	win.setTitle( message )
})


ipcMain.on('new-category', (event, message) => {
	
	win.webContents.send('context-category', message)
})


ipcMain.on('hyperlink', (event, message) => {
	
	win.webContents.send('add-hyperlink', message)
})


ipcMain.on('table', (event, message) => {
	
	win.webContents.send('add-table', message)
})


ipcMain.on('reload-sidebar', (event, message) => {
	
	win.webContents.send('reload-sidebar', message)
})


ipcMain.on('set-zoom-slider', (event, message) => {
	
	win.webContents.send('set-zoom-slider', message)
})


ipcMain.on('update-theme', (event, message) => {
	
	webContents.getAllWebContents().forEach( wc => {
		
		wc.send('set-theme', message)
	})
})


ipcMain.on('error-in-render', function(event, message) {
    
	log.error(`exception in render process:`)
	log.info (message)
})
