module.exports = function(grunt)
{
	grunt.initConfig
	(
		{
			ngconstant: 
			{
				options: 
				{
					space: '  ',
					dest: 'www/app/config.js',
					wrap: '"use strict";\n\n <%= __ngModule %>',
					name: 'config',
				},
				
				// Environment targets
				development: 
				{ 
					constants: 
					{
						ENV: {
							NAME: 'development',
							DEBUG: 'true',
							API_URL: 'http://localhost:8888/'
						}
					}
				},
				staging: 
				{
					constants: 
					{
						ENV: {
							 NAME: 'staging',
							 DEBUG: 'true',
							 API_URL: 'http://ar210.piim.newschool.edu:8888/'
						}
					 }
				 },
				 
				 production: 
				 {
					 constants: 
					 {
						 ENV: {
							 NAME: 'production',
							 DEBUG: 'false',
							 API_URL: 'http://ar210.piim.newschool.edu:8888/'
						 }
					 }
				 }
			}
		}
	);
	
	grunt.loadNpmTasks('grunt-ng-constant');
	
	grunt.registerTask
	(
		'default', 
		[
	   		'ngconstant:' + (grunt.option('environment')||'development'),
	    ]
	);
}