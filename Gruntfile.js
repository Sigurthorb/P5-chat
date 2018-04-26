
/*jshint esversion: 6 */
var PRODUCT = "example";

module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt, {
		scope : 'devDependencies',
		pattern : ['grunt-*']
	});
const os = require('os');
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
  			scripts: {
    			files: ['app/scripts/**/*.js', 'app/**/*.html', 'app/**/*.css', "app/index.html"],
    			tasks: ['jshint','concat','copy:main'],
    			options: {
    				livereload: true,
      				spawn: false
    			}
			}
		},
		jshint: {
      		files: ['Gruntfile.js', 'app/scripts/**/*.js'],
      		options: {
        		globals: {
          			jQuery: true
        		}
      		}
    	},
			copy: {
				main: {
					files: [
				 		{expand: true, flatten: true, src: ['app/views/**/*.html'], dest: 'dist/views', filter: 'isFile'},
						{expand: true, flatten: true, src: ['app/css/**/*.css'], dest: 'dist/css', filter: 'isFile'},
						{expand: true, flatten: true, src: ['app/index.html'], dest: 'dist/', filter: 'isFile'},
						{expand: true, flatten: true, src: ['app/images/**'], dest: 'dist/images', filter: 'isFile'},
						{expand: true, cwd:'app/node_modules', src: "**", dest:'dist/node_modules'}
			 		],
				},
				createInstaller: {
					files: [
						{expand: true, flatten: true, src: ['dist/*'], dest: 'build/src/dist/', filter: 'isFile'},
						{expand: true, flatten: true, src: ['package.json'], dest: 'build/src/', filter: 'isFile'},
						{expand: true, flatten: true, src: ['main.js'], dest: 'build/src/', filter: 'isFile'},
						{expand:true , src:['node_modules/**'], dest:'build/src'}
					],
				}
			},
			concat: {
				basic: {
					src: ['app/scripts/**/*.js'],
					dest: 'dist/app.js',
				}
			},
			electron : {
				package : {
					options : {
						name: PRODUCT,
						dir : 'dist/' + PRODUCT
					}
				}
			},
			'electron-windows-installer' : {
				app: {
					productName: PRODUCT,
			    src: 'src/' + PRODUCT + '-win32-x64',
			    dest: 'src/setup/'
			  }
			},
			'electron-packager': {
	      build: {
	        options:{
	          platform        : os.platform(),
	          arch            : os.arch(),
	          dir             : './build/src',
	          out             : './src/',
	          name            : PRODUCT,
	          ignore          : 'bower.json',
	          electronVersion : '1.6.2', // set version of electron
	          asar      : false,
	          overwrite : true
	        }
	      }
			},
			'jsbeautifier': {
	       files: ['app/scripts/**/*.js', 'app/**/*.html', 'app/**/*.css', 'app/index.html'],
	       options: {
	           html: {
	               braceStyle: 'collapse',
	               indentChar: ' ',
	               indentScripts: 'keep',
	               indentSize: 4,
	               maxPreserveNewlines: 10,
	               preserveNewlines: true,
	               unformatted: ['a', 'sub', 'sup', 'b', 'i', 'u'],
	               wrapLineLength: 0
	           },
	           css: {
	               indentChar: ' ',
	               indentSize: 2
	           },
	           js: {
	               braceStyle: 'collapse',
	               breakChainedMethods: false,
	               e4x: false,
	               evalCode: false,
	               indentChar: ' ',
	               indentLevel: 0,
	               indentSize: 2,
	               indentWithTabs: false,
	               jslintHappy: false,
	               keepArrayIndentation: false,
	               keepFunctionIndentation: false,
	               maxPreserveNewlines: 10,
	               preserveNewlines: true,
	               spaceBeforeConditional: true,
	               spaceInParen: false,
	               unescapeStrings: false,
	               wrapLineLength: 0,
	               endWithNewline: true
	           },
	       }
	   }
	});

	grunt.registerTask('default', [
		'jshint',
		'concat',
		'copy:main',
		'watch'
	]);

	grunt.registerTask('build', [
		'jshint',
		'concat',
		'copy:main'
	]);

	grunt.registerTask('dev', [
		'jshint',
		'watch'
	]);

	grunt.registerTask('createPackage', [
		'jshint',
		'concat',
		'copy:main',
		'copy:createInstaller',
		'electron-packager'
	]);

	grunt.registerTask('createApplication', [
		'electron-windows-installer'
	]);

	grunt.registerTask('beautify', [
		'jsbeautifier'
	]);

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-jsbeautifier');
	grunt.loadNpmTasks('grunt-electron-windows-installer');
	grunt.loadNpmTasks('grunt-electron-packager');
};
