  
  (function ($) {
    $(function () {
        let colorInput = document.querySelector("#colorInput");
        let colorValue = colorInput.value;
        var regExp = new RegExp(/^0x[0-9A-F]{1,4}$/i);

        // $("#radio-custom").click(function(){
            if ($('#radio-custom:checked').length > 0) {
                // ! doesn't work when custom is already selected and switching to new custom 
                document.querySelector("#colorInput").addEventListener('input', function () {
                    if (colorInput.value.startsWith("#")) {
                         if (!regExp.test(colorValue)){
                            $("label[for='radio-custom']").css('background-color', $("#colorInput")[0].value)
                            $("#radio-custom").attr("value", $("#colorInput")[0].value);
                         }
                        else {
                            console.error('o');
                        }
                    }
                    else {
                        console.error('Color input needs to start with a #');
                    }
                });
            }
        // });

        
        

        var customColor = document.querySelector("#radio-custom").value;
        $("label[for='radio-custom']").css('background-color', customColor);
    });
  }(jQuery))
  
          // background - color: #8cc1f3;