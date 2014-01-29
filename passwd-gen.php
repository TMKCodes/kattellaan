<?php
if($argc == 3) {
	file_put_contents(".passwd", base64_decode($argv[1] .":".$argv[2]));
} else {
	printf("This is simple passwd file script.\r\n");
	printf("passwd-gen.php username password\r\n");
}
?>
