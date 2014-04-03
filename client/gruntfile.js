module.exports = function (grunt) {
	'use strict';

    // Add tasks
    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');


    // Project configuration
    grunt.initConfig({
        browserSync: {
            dev: {
                bsFiles: {
                    src: [
                        'app/styles/css/*.css',
                        'app/scripts/**/*.js',
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
                proto: true
            },
            gruntfile: {
                src: 'gruntfile.js'
            },
            scripts: {
                src: ['app/scripts/**/*.js']
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
                files: ['app/scripts/**/*.js'],
                tasks: ['jshint:scripts'],
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
    grunt.registerTask('serve', ['jshint:scripts', 'less', 'browserSync','watch']);
};