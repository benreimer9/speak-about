<?php
/**
 * @package SpeakAbout
 * @version 1.0.0
 */
/*
Plugin Name: SpeakAbout
Plugin URI: https://speakabout.blog/
Description: Connect with your blog readers through an interactive highlighting tool.
Author: Ben Reimer
Version: 1.0.0
Author URI: https://www.benreimer.design
*/

//THE EXAMPLE
// add_action( 'the_content', 'my_thank_you_text' );

// function my_thank_you_text ( $content ) {
// 	$urll = admin_url("admin-ajax.php");
//     return $content .= $urll;
// }

//ENQUEUE MY JS
function speakabout_enqueue_script() { 
	wp_enqueue_script('rangycore', plugin_dir_url(__FILE__) . 'rangy-core.js');
	wp_enqueue_script('rangyclass', plugin_dir_url(__FILE__) . 'rangy-classapplier.js');
	wp_enqueue_script('rangyhighlighter', plugin_dir_url(__FILE__) . 'rangy-highlighter.js');
	wp_enqueue_script('index', plugin_dir_url(__FILE__) . 'index.js', array('jquery'));
	wp_enqueue_style('speakaboutstyle', plugin_dir_url(__FILE__) . 'speak-about-style.css');
	wp_localize_script( 'index', 'sa_ajax', array( 
	'ajaxurl' => admin_url( 'admin-ajax.php')
	));
	// wp_localize_script('index', 'sa_ajax', array(
   	// 'pluginsUrl' => plugins_url(),
	// ));
}
add_action('wp_enqueue_scripts', 'speakabout_enqueue_script');


// Email the report
// add_action( 'wp_ajax_my_action', 'email_report' );
// add_action( 'wp_ajax_nopriv_my_action', 'email_report' );
add_action( 'wp_ajax_siteWideMessage', 'wpse_sendmail' );
add_action( 'wp_ajax_nopriv_siteWideMessage', 'wpse_sendmail' );

function wpse_sendmail()
{
	$report = $_POST['report'];
	$title = $_POST['title'];
	$title_url = $_POST['title_url'];
	// $highlight = $_POST['highlight'];
	// $email = $_POST['email'];
    // $email = $_POST['email'];
    // $headers = 'From: '.$email ."\r\n".'Reply-To: '.$email;
    // $message = $_POST['message_message'];
    // $respond = $_POST['message_email'];

    /*if(wp_mail( "support@ontrgt.net", "(OTN) Support: ".$for, $message, $headers))
    {
        echo "WOOHOO";
	}*/
	echo "title : " . $title; 

	
	$emailHead = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml"><head><!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]--><meta content="text/html; charset=utf-8" http-equiv="Content-Type"/><meta content="width=device-width" name="viewport"/><!--[if !mso]><!--><meta content="IE=edge" http-equiv="X-UA-Compatible"/><!--<![endif]--><title></title><!--[if !mso]><!--><!--<![endif]--><style type="text/css">body {margin: 0;padding: 0;}table,td,tr {vertical-align: top;border-collapse: collapse;}* {line-height: inherit;}a[x-apple-data-detectors=true] {color: inherit !important;text-decoration: none !important;}</style><style id="media-query" type="text/css">@media (max-width: 520px) {.block-grid,.col {min-width: 320px !important;max-width: 100% !important;display: block !important;}.block-grid {width: 100% !important;}.col {width: 100% !important;}.col>div {margin: 0 auto;}img.fullwidth,img.fullwidthOnMobile {max-width: 100% !important;}.no-stack .col {min-width: 0 !important;display: table-cell !important;}.no-stack.two-up .col {width: 50% !important;}.no-stack .col.num4 {width: 33% !important;}.no-stack .col.num8 {width: 66% !important;}.no-stack .col.num4 {width: 33% !important;}.no-stack .col.num3 {width: 25% !important;}.no-stack .col.num6 {width: 50% !important;}.no-stack .col.num9 {width: 75% !important;}.video-block {max-width: none !important;}.mobile_hide {min-height: 0px;max-height: 0px;max-width: 0px;display: none;overflow: hidden;font-size: 0px;}.desktop_hide {display: block !important;max-height: none !important;}}</style></head><body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #FFFFFF;"><!--[if IE]><div class="ie-browser"><![endif]--><table bgcolor="#FFFFFF" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="table-layout: fixed; vertical-align: top; min-width: 320px; Margin: 0 auto; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #FFFFFF; width: 100%;" valign="top" width="100%"><tbody><tr style="vertical-align: top;" valign="top"><td style="word-break: break-word; vertical-align: top;" valign="top"><!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color:#FFFFFF"><![endif]--><div style="background-color:transparent;"><div class="block-grid" style="Margin: 0 auto; min-width: 320px; max-width: 500px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px"><tr class="layout-full-width" style="background-color:transparent"><![endif]--><!--[if (mso)|(IE)]><td align="center" width="500" style="background-color:transparent;width:500px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;"><![endif]--><div class="col num12" style="min-width: 320px; max-width: 500px; display: table-cell; vertical-align: top; width: 500px;"><div style="width:100% !important;"><!--[if (!mso)&(!IE)]><!--><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><!--<![endif]--><!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-family: Arial, sans-serif"><![endif]--><div style="color:#555555;font-family:Arial, Helvetica, sans-serif;line-height:120%;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;"><div style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 14px; color: #555555;">
	<p style="font-size: 14px; line-height: 24px; margin: 0;"><span style="font-size: 22px;">
		Your page <strong><a href="' . $title_url . '" style="text-decoration:none;color:#202020">' . $title . '</a></strong> has new feedback!</span></p></div></div><!--[if mso]></td></tr></table><![endif]--><table border="0" cellpadding="0" cellspacing="0" class="divider" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top" width="100%"><tbody><tr style="vertical-align: top;" valign="top"><td class="divider_inner" style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; 
		padding-bottom: 20px; padding-left: 10px;" valign="top"><table align="center" border="0" cellpadding="0" cellspacing="0" class="divider_content" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 1px solid #BBBBBB; width: 100%;" valign="top" width="100%"><tbody><tr style="vertical-align: top;" valign="top"><td style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top"><span></span></td></tr></tbody></table></td></tr></tbody></table>';
	$emailBase = '<!--[if mso]></center></v:textbox></v:roundrect></td></tr></table><![endif]--></div><!--[if (!mso)&(!IE)]><!--></div><!--<![endif]--></div></div><!--[if (mso)|(IE)]></td></tr></table><![endif]--><!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]--></div></div></div><!--[if (mso)|(IE)]></td></tr></table><![endif]--></td></tr></tbody></table><!--[if (IE)]></div><![endif]--></body></html>';
	$message = stripslashes($report);
	$message = $emailHead . $message . $emailBase; 


	$to = "benreimer9@gmail.com";
	$subject = "Test from SpeakAbout";
	
	$headers = array('Content-Type: text/html; charset=UTF-8');
	wp_mail( $to, $subject, $message, $headers);
    die();
}









/** Options Admin */
add_action( 'admin_menu', 'speak_about_menu' );

function speak_about_menu() {
	add_options_page( 'SpeakAbout Options', 'SpeakAbout', 'manage_options', 'my-unique-identifier', 'speak_about_options' );
}

function speak_about_options() {
	if ( !current_user_can( 'manage_options' ) )  {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
	}
    echo '<div class="wrap">';
    echo '<h1>SpeakAbout Settings.</h1>';
	echo '<p>Here is where the form would go if I actually had options.</p>';
	echo '</div>';
}
 
?>
