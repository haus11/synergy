module.exports = function (grunt) {
	'use strict';

    // Add tasks
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');


    // Project configuration
    grunt.initConfig({
        browserify: {
            js: {
                files: {
                  './app/scripts/dist/build.js': ['./app/scripts/src/main.js']  
                },
                options: {
                    bundleOptions: {
                        debug: true
                    }
                }
            }
        },

        browserSync: {
            dev: {
                bsFiles: {
                    src: [
                        'app/styles/css/*.css',
                        'app/scripts/dist/*.js',
                        'app/*.html'
                    ]
                },
                options: {
                    watchTask: true,
                    server: {
                        baseDir: 'app'
                    }
                }
            }
        },

        jshint: {
            options: {
                node: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                proto: true,
				ignores: ['app/scripts/src/Cesium.js']
            },
            gruntfile: {
                src: 'gruntfile.js'
            },
            scripts: {
                src: ['app/scripts/src/**/*.js', '!app/scripts/src/cesium/**/*.js']
            }
        },

        less: {
            development: {
                files: {
                    'app/styles/css/main.css': 'app/styles/main.less'
                }
            }
        },

        watch: {
            scripts: {
                files: ['app/scripts/src/**/*.js'],
                tasks: ['jshint:scripts', 'browserify'],
                options: {
                    spawn: false
                }
            },
            styles: {
                files: ['app/styles/*.less'],
                tasks: ['less']
            }
        }
    });


    // Command line tasks
    grunt.registerTask('serve', [
        'jshint:scripts', 
        'browserify',
        'less', 
        'browserSync',
        'watch']);
};
