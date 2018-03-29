module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      dist: {
        files: [ 
            {src: 'src/vrij-loon.html', dest: 'dist/vrij-loon.html'},
            { expand: true, flatten: true, src: 'bower_components/bootstrap/dist/fonts/*', dest: 'dist/fonts/' },
        ]
      }
    },

    'useminPrepare': {
      options: {
        root: 'src',
        dest: 'dist'
      },
      html: 'src/vrij-loon.html'
    },

    usemin: {
        html: 'dist/vrij-loon.html',
    },
    
    uglify: {
        options: {
            preserveComments: 'some'
        },
    },
    
    replace: {
        build: {
            options: {
                patterns: [{
                      match: 'version',
                      replacement: 'v<%= pkg.version %>'
                    },{
                    match: /<!--\s*embed:?(zip)?\s*-->([\s\S]+?)<!--\s*endembed\s*-->/gm,
                    replacement: function() {
                        if(arguments[2].length) {
                            var content = {css: '', js: ''},
                                files = arguments[2].match(/(src|href)=["']?([^"']+)["']?/gm);
                            
                            if(files.length) {
                                var file, cssOrJs, replacement = '';
                                
                                var defer = arguments[2].match(/ defer/i);
                                for(var i = 0; i < files.length; i++) {
                                    file = 'dist/' + files[i].substr(4).replace(/["'=]/g, ''); // Fix for buggy editor syntax highlighting: '"
                                    cssOrJs = files[i].match(/href/) ? 'css' : 'js';
                                
                                    if(arguments[1] == 'zip' && files.length == 1 && grunt.file.exists(file + '.zip')) {
                                        replacement+= '<script defer>JSZip.loadAsync(window.atob(\'';
                                        replacement+= grunt.file.read(file + '.zip', { encoding: null }).toString('base64');
                                        replacement+= '\')).then(function(a){return a.file(\'' + file.substr(file.lastIndexOf('/')+1) + '\').async("string"); })';
                                        
                                        if(cssOrJs == 'css') {
                                            replacement+= '.then(function(a){b=document.createElement(\'style\');b.innerText=a;document.querySelector(\'head\').appendChild(b);});';
                                        }else if(cssOrJs == 'js') {
                                            replacement+= '.then(function(a){b=document.createElement(\'script\');b.text=a;document.body.appendChild(b);});';
                                        }
                                        
                                        replacement+= '</script>';
                                        
                                        // Immediately cleanup zip files
                                        grunt.file.delete(file + '.zip');
                                    }else{
                                        content[cssOrJs]+= grunt.file.read( file );
                                    }
                                }
                                if(content['css']) {
                                    replacement+= '<style type="text/css">' + content['css'] + '\n</style>';
                                }
                                
                                if(content['js']) {
                                    replacement+= '<script' + (defer ? ' defer' : '') + '>' + content['js'] + '\n</script>';
                                }
                                return replacement;
                            }
                        }
                    }
                }]
            },
            files: [
                {expand: false, src: ['dist/vrij-loon.html'], dest: 'dist/vrij-loon.single.html'}
            ]
        },
        bumpVersion: {
            options: {
                patterns: [
                    { match: 'version', replacement: 'v<%= pkg.version %>' },
                ]
            },
            files: [
                { expand: false, src: ['dist/vrij-loon.html'], dest: 'dist/vrij-loon.html' },
                { expand: false, src: ['dist/vrij-loon.single.html'], dest: 'dist/vrij-loon.single.html' }
            ]
        }
    },
    
    embedFonts: {
        all: {
            files: {
                'dist/css/vrij-loon.min.css': ['dist/css/vrij-loon.min.css']
            }
        }
    },
    
    htmlmin: {
        dist: {
            options: {
                html5: true,
                removeComments: true,
                collapseWhitespace: true,
                minifyCSS: true,
                minifyJS: true,
                removeStyleLinkTypeAttributes: true,
                processScripts: [ 'text/x-jsrender' ],
            },
            files: [
                { src: ['dist/vrij-loon.html'], dest: 'dist/vrij-loon.html' },
            ]
        },
        distSingle: {
            options: {
                html5: true,
                removeComments: true,
                collapseWhitespace: true,
                ignoreCustomComments: [ /embed/, /zip/ ],
                minifyCSS: true,
                minifyJS: false,
                removeStyleLinkTypeAttributes: true,
                processScripts: [ 'text/x-jsrender' ],
            },
            files: [
                { src: ['dist/vrij-loon.single.html'], dest: 'dist/vrij-loon.single.html' },
            ]
        },
        distSingleJS: {
            options: {
                html5: true,
                removeComments: true,
                collapseWhitespace: true,
                minifyCSS: true,
                minifyJS: true,
                removeStyleLinkTypeAttributes: true,
                processScripts: [ 'text/x-jsrender' ],
            },
            files: [
                { src: ['dist/vrij-loon.single.html'], dest: 'dist/vrij-loon.single.html' },
            ]
        },
    },
    
    embedZippedPrepare: {
        html: {
            options: {},
            files: [
                { src: 'dist/vrij-loon.single.html', dest: 'dist/vrij-loon.single.html'}
            ]
        },
    },
    
    release: {
        options: {
            npm: false,
            tagName: 'v<%= version %>'
        }
    }
    
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-embed-fonts');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-release');

  grunt.registerMultiTask('embedZippedPrepare', '', function() {
    var options = this.options(),
        staging = options.staging || '.tmp/zip/',
        compressTasks = {}, 
        srcConfig = {};
    
    this.files.forEach(function(filePair) {
        var destFile = filePair.dest,
            fileBase = destFile.substr( destFile.lastIndexOf('/') + 1 ),
            content = '';
        
        filePair.src.forEach(function(srcFile) {
            var fileName;
            
            srcConfig[destFile] = { html: [], css: [], js: [] };
            
            compressTasks[fileBase] = { 
                options: {
                    archive: staging + '/' + fileBase + '.zip',
                },
                files: [ { expand: true, cwd: '.tmp/zip/', src: [], dest: '/' } ],
            };
            
            
            content+= grunt.file.read(srcFile).replace(/<!--\s*zip:(css|js|html)?\s*-->([\s\S]+?)<!--\s*endzip\s*-->/gm, function() {
                var counter = srcConfig[destFile][arguments[1]].length + 1;
                
                fileName = arguments[1].substr(0,1) + counter + '.' + arguments[1];
                
                srcConfig[destFile][arguments[1]].push(fileName);
                
                compressTasks[fileBase].files[0].src.push(fileName);
                
                if(arguments[1] == 'html') {
                    grunt.file.write(staging + fileName, arguments[2], { encoding: 'utf-8' });
                }else{
                    var tag = arguments[1] == 'css' ? 'style' : 'script';
                    //console.log(tag, arguments[2].substr(0, 24), arguments[2].substr(-20));
                    //console.log('<'+tag+'>([\s\S]+?)</'+tag+'>');
                    var subcontent = '';
                    arguments[2].replace(new RegExp('<'+tag+'>([\\s\\S]+?)</'+tag+'>', 'gmi'), function() {
                        subcontent+= arguments[1];
                    });
                    grunt.file.write(staging + fileName, subcontent, { encoding: 'utf-8' });
                }
                
                return '';
            });
        });
        
        grunt.file.write(destFile, content);
        
        var compressConfig = grunt.config('compress') || {};
        compressConfig = compressTasks;
        grunt.config('compress', compressConfig );
        
        var embedZippedConfig = grunt.config('embedZipped') || {}
        embedZippedConfig[grunt.task.current.target] = { options: { srcConfig: srcConfig } };
        grunt.config('embedZipped', embedZippedConfig);
    });
  });
  
  grunt.registerMultiTask('embedZipped', '', function() {
    var options = this.options();
    
    var prepareOptions = grunt.config('embedZippedPrepare')[grunt.task.current.target].options;
    
    var staging = prepareOptions.staging || '.tmp/zip/';
    
    // Add the javascript that unzips the embedded zipfile,
    // use promises to ensure we load data in the right order
    // first html, then css, then js
    for(var srcFile in options.srcConfig) {
        var content = grunt.file.read(srcFile);
        
        content = content.replace(/<\/body>/i, function() {
            replacement = '<script defer>JSZip.loadAsync(window.atob(\'';
            replacement+= grunt.file.read(staging + srcFile.substr( srcFile.lastIndexOf('/') + 1) + '.zip', { encoding: null }).toString('base64');
            replacement+= '\')).then(function(zip) {';
            
            for(var type in options.srcConfig[srcFile]) {
                for(var i = 0; i < options.srcConfig[srcFile][type].length; i++) {
                    if(type == 'html' && i == 0) {
                        replacement+= 'zip.file(\'' + options.srcConfig[srcFile][type][i] + '\').async("string")';
                    }else{
                        replacement+= `.then(function(){
                                return zip.file('` + options.srcConfig[srcFile][type][i] + `').async("string");
                                })`;
                    }
                    
                    if(type == 'css') {
                        replacement+= `.then(function(cssCode){
                            return new Promise(function(resolve){
                                var styleElement = document.createElement('style');
                                styleElement.innerText=cssCode;
                                document.querySelector('head').appendChild(styleElement);
                                resolve();
                            });
                        })`;
                    }else if(type == 'js') {
                        replacement+= `.then(function(jsCode){
                            return new Promise(function(resolve){
                                var scriptElement = document.createElement('script');
                                scriptElement.text=jsCode;
                                document.body.appendChild(scriptElement);
                                resolve();
                            })
                        })`;
                    }else if(type == 'html') {
                        replacement+= `.then(function(htmlCode){
                            return new Promise(function(resolve){
                                document.body.innerHTML+=htmlCode
                                resolve();
                            })
                        })`;
                    }
                }
            }
            replacement+= '});</script>';
            replacement+= arguments[0];
            
            return replacement;
        });
        
        grunt.file.write(srcFile, content);
    }
  });

  grunt.registerTask('build', ['useminPrepare', 
                                 'copy', 
                                 'concat', 
                                 'cssmin', 
                                 'uglify', 
                                 'usemin', 
                                 'embedFonts', 
                                 'replace:build', 
                                 'htmlmin:dist', 
                                 'htmlmin:distSingle', 
                                 'embedZippedPrepare', 
                                 'compress', 
                                 'embedZipped', 
                                 'htmlmin:distSingleJS']);
  
  // Convert Help page to README.md
  grunt.registerTask('readme', function() {
    var toMarkdown = require('to-markdown'),
        file = grunt.file.read('src/vrij-loon.html', {encoding: 'utf-8'}),
        re = /help<\/h1>([\s\S]+?<\/p>\s*<\/div>)\s*<\/p>\s*<\/div>/mi,
        matches = re.exec(file),
        mdReadme = toMarkdown(matches[1], { gfm: true });
    
    header = '# Vrij Loon\n\n';
    grunt.file.write('README.md', header + mdReadme.replace(/<\/?div>/gi, ''));
  });
  
};

