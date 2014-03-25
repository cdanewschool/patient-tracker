module.exports = function(grunt)
{
	grunt.initConfig
	(
		{
			ngconstant: 
			{
				options: 
				{
					name: 'config',
					dest: 'www/app/config.js',
					wrap: '"use strict";\n\n {%= __ngModule %}'
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
			},
			
			includeSource:
			{
				options:
				{
				    templates: 
				    {
				    	html: 
				    	{
				    		js: '<script src="{filePath}"></script>',
				    		css: '<link rel="stylesheet" type="text/css" href="{filePath}" />',
				    	}
				    }
				},
				development: 
				{
					files: 
					{
						'www/index.html': 'dist/index.tpl.html'
					}
				},
				staging: 
				{
					files: 
					{
						'www/index.html': 'dist/index.tpl.html'
					}
				},
				production: 
				{
					files: 
					{
						'www/index.html': 'dist/index.tpl.html'
					}
				}
			}
		}
	);
	
	grunt.loadNpmTasks('grunt-ng-constant');
	grunt.loadNpmTasks('grunt-include-source');
	
	grunt.registerTask
	(
		'default', 
		[
	   		'ngconstant:' + (grunt.option('environment')||'development'),
	   		'includeSource:' + (grunt.option('environment')||'development')
	    ]
	);
}