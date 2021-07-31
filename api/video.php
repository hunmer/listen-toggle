<?php
header("Access-Control-Allow-Origin: *");
// $_GET['type'] = 'url';
// // $_GET['name'] = '深海少女';
//  $_GET['id'] = 'I0bDMBXM_Fk';

$type = getParam('type');
$server = getParam('server', 'youtube');
if($server == 'youtube'){
	switch ($type) {
		case 'search':
			$ch = curl_init();
			$options =  array(
				CURLOPT_HEADER => false,
				CURLOPT_URL => 'https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=' . urlencode(getParam('name')) . '&key=AIzaSyC2M5g_EB_VZO-1OVC68iGL6dcJ9XApJT0',
				CURLOPT_RETURNTRANSFER => true,
				CURLOPT_TIMEOUT => 10,
				CURLOPT_PROXYAUTH => CURLAUTH_BASIC,
				CURLOPT_SSL_VERIFYPEER => false,
				CURLOPT_SSL_VERIFYHOST => false,
				CURLOPT_PROXY => "127.0.0.1",
				CURLOPT_PROXYPORT => 1080,
				CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36 Edg/81.0.416.58'
			);
			curl_setopt_array($ch, $options);
			$content = json_decode(curl_exec($ch), true);
			curl_close($ch);

			$ret = [];
			foreach($content['items'] as $detail){
				$id = $detail['id']['videoId'];
				$ret[] = [
					'id' => $id,
					'name' => $detail['snippet']['title'],
					'artist' => $detail['snippet']['channelTitle'],
					'pic' => $detail['snippet']['thumbnails']['medium']['url'],
					'url' => 'https://alltubedownload.net/download?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D'.$id,
					'source' => 'youtube'
				];
			}
			echo json_encode($ret);
			break;
			
		case 'url':
			$ch = curl_init();
			$options =  array(
				CURLOPT_URL => 'https://alltubedownload.net/json?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D'.getParam('id'),
				CURLOPT_HEADER => false,
				CURLOPT_RETURNTRANSFER => true,
				CURLOPT_TIMEOUT => 30,
				CURLOPT_PROXYAUTH => CURLAUTH_BASIC,
				CURLOPT_SSL_VERIFYPEER => false,
				CURLOPT_SSL_VERIFYHOST => false,
				CURLOPT_PROXY => "127.0.0.1",
				CURLOPT_PROXYPORT => 1080,
				CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36 Edg/81.0.416.58'
			);
			curl_setopt_array($ch, $options);
			$json = json_decode(curl_exec($ch), true);

			// foreach($json['formats'] as $v){
			// 	if(!is_null($v['filesize'])){
					$s_url = 'https://alltubedownload.net/download?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D'.getParam('id').'&format='.$json['format_id'];
					//break;
				//}
			//}
					// echo $s_url;
			curl_close($ch);
			
			header('Location: '.$s_url);
			break;
	}
	return;
}


function getParam($key, $default=''){
    return trim($key && is_string($key) ? (isset($_POST[$key]) ? $_POST[$key] : (isset($_GET[$key]) ? $_GET[$key] : $default)) : $default);
}
