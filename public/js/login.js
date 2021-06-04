// $(document).ready(function () {
//     $("#btn").submit(function (event) {
//         event.preventDefault()
//     })
// })
// // // console.log("Working")
// // function getFormData($form){
// //     var unindexed_array = $form.serializeArray();
// //     var indexed_array = {};

// //     $.map(unindexed_array, function(n, i){
// //         indexed_array[n['name']] = n['value'];
// //     });

// //     return indexed_array;
// // }

// // $(document).ready(function () {
// //     $("#btn").submit(function (event) {
// //         event.preventDefault()
// //         var form = $(this);
// //         var data = getFormData(form);
// //         console.log(data)
// //         var url = form.attr('action');
// //         $.ajax({
// //             type: "POST",
// //             url: url,
// //             data,
// //             success: function (data, status) {
// //                 // alert("You will now be redirected.");
// //                 window.localStorage.setItem('token', 'Bearer '+data);
// //                 console.log(data)
// //             }
// //         });
// //     })
// // })

// // // for setting header
// // //https://stackoverflow.com/questions/35861012/how-to-send-a-token-with-an-ajax-request-from-jquery#:~:text=I%20use%20express%2Djwt%20and,function(err)%20%7B%20console.