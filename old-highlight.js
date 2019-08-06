var highlightObject, highlightString, highlightParent,
  highlightParentString,
  newString,
  startPos,
  endPos,
  highlightPrevSibling,
  pos;

  /*  
THE POSITION METHOD
don't screw with elements. Wise. 
example: https: //github.com/lpimem/hlc
based on rangeblocks: https: //github.com/lpimem/rangeblock

however, depends on relative or absolute parent and will fail without - something I can't quite guarantee. 
*/



  /* 
  THE SPAN METHOD
  okay so the disadvantage of this is that adding multiple spans gets all funky.
  it can really screw with layout. 
  */


  function addHighlightCSS(highlightObject) {
      //grab highlighted text
      //see composition
      //any broken tags? (ie. end tag with not start) flag it. Not sure what else to do about it tho lol
      //add spans within tags 

      /* note MDN : 
      https://developer.mozilla.org/en-US/docs/Web/API/Selection
      Anchor and focus should not be confused with the start and end positions of a selection. 
      The anchor can be placed before the focus or vice-versa, depending on the direction 
      you made your selection.
      */

      //MY PROBLEM! position changes with siblings nodes, but I was rebuilding from the parent unaware of this. 
      //So I need not the "start pos" but the start from the parent


      if (!isNotJustAClick(highlightObject)) return; 
      if (selectionIsAllOneNode(highlightObject)){
        oneNodeHighlight(highlightObject);
        addStat("one node!");
      }
      else {
        multipleNodeHighlight(highlightObject)
        addStat("not one node!");
      }
  }

  function oneNodeHighlight(highlightObject){
    highlightString = highlightObject.toString();
    highlightParent = highlightObject.focusNode.parentElement;
    highlightParentString = highlightParent.innerHTML;
    highlightPrevSibling = highlightObject.anchorNode.previousSibling;
    startPos = highlightObject.anchorOffset;
    endPos = highlightObject.focusOffset;
    pos = highlightParentString.search(highlightString);

    console.log("start pos : ", startPos);
    console.log("end pos : ", endPos);

    console.log('get range at : ', highlightObject.getRangeAt(0));

    if (selectionParentOnlyHasOneChildNode(highlightObject)){
      //build off parent
      newString = highlightParentString.slice(0, startPos) + `<mark style="background-color:red"> ${highlightString} </mark>` + highlightParentString.slice(endPos);
      //highlightParent.innerHTML = newString;
    } else {
      //build off previous sibling, which startPos gets its number from
      let prevSibText = highlightPrevSibling.textContent; 
      console.log('sib : ', highlightPrevSibling.textContent);
      //newString = highlightParentString.slice(0, startPos) + `<mark style="background-color:red"> ${highlightString} </mark>` + highlightParentString.slice(endPos);

    }

  }

  function multipleNodeHighlight(highlightObject){

  }

  function isNotJustAClick(){
    return (highlightObject.anchorOffset !== highlightObject.focusOffset);
  }
  function selectionIsAllOneNode(highlightObject){
    return (highlightObject.anchorNode === highlightObject.focusNode);
  }
  function selectionParentOnlyHasOneChildNode(highlightObject){
    return (highlightObject.focusNode.parentElement.children.length === 0)
  }
  function addStat(stat) {
    let statEl = document.getElementById("stats");
    statEl.innerHTML = stat;
  }