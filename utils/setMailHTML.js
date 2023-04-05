
const setMailHTML = (data) => {
	const {type, code} = data;



	let styles =`
		<style>
			ul,li{list-style:none;}
			*{margin: 0; padding: 0; box-sizing: border-box; font-family: tahoma;}

			table {
					border: 1px solid #ccc;
					border-spacing: 3px;
			}

			td, th{
					border: solid 1px #ccc;
			}

			h1.title{
				color:#fff;
				margin-bottom: 20px;
				text-align:center;
			}

			 h3.title{
				 color:#E5BD51;
				 text-align:center;
				 margin-bottom: 10px;
			 }

			 .wrapper{
			 	border-radius: 20px;
				 background: #222;
				 color: #fff;
				 max-width: 500px;
				 margin: 0 auto;
			 	 min-height: 400px;
				 overflow: auto;
				 padding: 50px 15px;
			 }


			 .img-cont{
				 margin: 0 auto;
				 width: 80%;
				 max-width: 200px;
				 aspect-ratio:1/1;
				 background-image: url('https://lh3.googleusercontent.com/LiA8gizylB9X1b8Zl9oDwdkPKzcnN0rwg1y8XUkONNMCZOd9ug1SRDlrPo7DerxqyyNatLW3wGpxuXI1IukHu5axaxE-H44A7McIRCoVKNR_C7ShMjlixdjHZDojDN7Nygm8qV_aqWDWAhBkim0Bxa1iL5jQ7JwDk970wHa52llSjryrvRKku_a7Z0hMbNaPNImJ0m3DtVA_gi34Ty8CDnRpLEE4lvcmfMbis_f6L_4K0Jl9rTaa1rCSrHIA-fLgZ_ubrrqqT5GOa_AXrTq8rgB9CRCn7TlExpxD5Nm5KQ-ggfbrNJwzNVRYS6VOZUdmq9Aqo-R-TvlrBwfhD_OxxvEGkQ6JEhhAXavITTJxUkGdgF9qyEbeBi2C7fVd4FRWJ7tD3VOrpjQppV0pntI1d1P5OQLQE8ETW-a2yoXZq3N00PvlS_HtqgJy12Q58Fyj440SuD4cxFbCUkQenUL7OcGjTd5T_z2oKmFOkp9AEf_cbrcivrXi4Q4peUGtbXbP8qokmx3_YL_TzVcf4z2UzDlpLIESmVJDdR46i4jFo7DPrHe7KVd0wZTcQqpbF4gjh4nWonvZYSybAq2SyB4V_5-PkT0kaBJCh5cPBV0v0cjSHBqfH4h2PKRqXymF_9NAWPd6AsLJjjJJetGMYLBnwNcZ8CkfqIICBFAK9OgLBLbKKzyOzzgG_rcYqcdBP4ZgoFC2ZLkFQ9L1qp4zZXKrfiwVXjdJijAGtXiuR1knnsYulCwMTMuVcN79uMVx=w701-h700-no?authuser=0');
				 background-position: center center;
				 background-size: contain;
			 }



			 .container{
				 margin: 0 auto;
			 }


			 .table{
				 max-width: 360px;
				 width: 100%;
				 margin: 0 auto;
			 }


			 .key{
 				padding: 5px 10px;
				 width:150px;
				 color: #E5BD51;
				 text-align: center;
			 }

			 .value{
			 	padding: 5px 10px;
				 color: #fff;
			 }
		</style>
	`;



	let head = `
		<head>
			 <meta charset="utf-8" />
			 <title>HTML Document</title>
			 ${styles}
		</head>`;

	let body = `
		<body>
			<div class="wrapper">
				<div class='container'>
					<h1 class='title'>Hedgehog.tech</h1>
					<h3 class='title'>${type}</h3>
			 		<span class='code'>${code}</span>
					<div class='img-cont'></div>
				</div>
			</div>
	  </body>`;


	let html = `<!DOCTYPE html>	<html> ${head}	${body} </html>`;
	return html;
}



export default setMailHTML;
