module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        neuter: {
            options: {
                template: '{%= src %}'
            },
            application: {
                src: 'src/plugin-wrapper.js',
                dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },

        watch: {
            scripts: {
                files: ['src/**/*.js'],
                tasks: ['neuter', 'uglify'],
                options: {
                    spawn: false
                }
            }
        },

        uglify: {
            my_target: {
                files: {
                    'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': ['dist/<%= pkg.name %>-<%= pkg.version %>.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-neuter');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['neuter', 'uglify']);
    grunt.registerTask('dev', ['neuter', 'uglify', 'watch']);

};