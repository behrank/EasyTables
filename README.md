# EasyTables
Jquery EasyTables for Datatable.js

This plugin is a helper for Datatables.js (https://www.datatables.net/) for .Net developers. 

Its makes easier to initialize a datatable with few lines of code. 

# How to use

1. Add jquery.easytables.js to your page.
2. Create a controller to send column names and search requirement info to easytables. Also a partial view to render view.
Example:
Controller:
```
[ChildActionOnly]
public ActionResult GetTableView(int typeOfTable)
{
   var colmNames = new Dictionary<string, bool>();
   switch (typeOfTable)
    {
        //List of colm names
        case 1:
        colmNames = new Dictionary<string, bool>
        {
            {"title",true},{"title 1",true} // Key:title of column, Value:Determine a search functionality is reqiured or not.
        };
        break;
        default:
        break;
    }
    ViewBag.TableHeaders = colmNames;
    return PartialView("_tableView"); //this is our partial view to render datatable
```}

Partial View:
```
<table id="dyntable">
    <thead>
    <tr role="row">
        @{
            foreach (var t in ViewBag.TableHeaders)
            {
                <th>@t.Key</th>
            }
        }
    </tr>
    <tr class="sptl">
        @{
            foreach (var t in ViewBag.TableHeaders)
            {
                //add an input if search feature is needed
                if ((bool)t.Value)
                {
                    <th><input type="text" name="search_engine" value="" class="form-control input-sm"/></th>
                }
                else
                {
                    <th></th>
                }

            }
        }
    </tr>
    </thead>
    <tbody id="tableBody"></tbody>
</table>
```
3. Add this simple code to your page
```
    jQuery(document).ready(function() {
        //Datatable initialization
        easyTables.create({
            elementId: "dyntable", //table body ID
            colmCount: 5, //how many columns you need
            Source: "/controller/method", //URL of API
            params: [
                 //{ param-key:  param-value} // if your API needs some parameters to work.
            ],
            extensions: extMethods 
        });
    });
```
