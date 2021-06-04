// // console.log("Working")
// // function getFormData($form){
// //     var unindexed_array = $form.serializeArray();
// //     var indexed_array = {};

// //     $.map(unindexed_array, function(n, i){
// //         indexed_array[n['name']] = n['value'];
// //     });

// //     return indexed_array;
// // }
// // after submitting it is just reloding
// $(document).ready(function () {
//     $("#btn").submit(function (event) {
//         event.preventDefault()
//         var form = $(this);
//         var data = getFormData(form);
//         console.log(data)
//         var url = form.attr('action');
//         $.ajax({
//             type: "POST",
//             url: url,
//             data,
//             success: function () {
//                 // alert("You will now be redirected.");
//                 location.reload(); // show response from the php script.
//             }
//         });
//     })
// })