app.directive('jqmRefreshable', function()
{
    return {
        restrict : 'A',
        
        link : function(scope, element, attrs)
        {
            scope.$watch(attrs.jqmRefreshable, function(newVal, oldVal)
            {
                if( attrs.jqmType )
                {
                    try {
                        if( attrs.jqmType == "checkbox" )
                            $(element).checkboxradio("refresh");
                        else
                            $(element)[attrs.jqmType]('refresh');
                    } catch (ex) {}
                }
                else
                {
                    $(element).trigger("create");
                }
            },true);
        }
    };
});