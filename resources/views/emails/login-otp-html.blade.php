<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>{{ $heading }}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
        Your AMS Portal code expires in {{ $minutes }} minutes.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
        <tr>
            <td align="center" style="padding:24px 12px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                       style="max-width:480px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;">
                    <tr>
                        <td align="center" style="padding:28px 24px 8px 24px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" bgcolor="#0284C7"
                                        style="background-color:#0284C7;border-radius:12px;padding:10px 16px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;letter-spacing:2px;color:#ffffff;">
                                        AMS
                                    </td>
                                </tr>
                            </table>
                            <div style="padding-top:10px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#64748b;">
                                Army Medical School Portal
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:16px 28px 0 28px;font-family:Arial,Helvetica,sans-serif;">
                            <h1 style="margin:0;font-size:22px;line-height:28px;color:#0f172a;text-align:center;">
                                {{ $heading }}
                            </h1>
                            <p style="margin:12px 0 0 0;font-size:15px;line-height:22px;color:#334155;text-align:center;">
                                {{ $intro }}
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding:24px 28px 8px 28px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" bgcolor="#f0f9ff"
                                        style="background-color:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:18px 8px;">
                                        <span style="display:inline-block;font-family:'Courier New',Courier,monospace;font-size:34px;line-height:40px;font-weight:bold;letter-spacing:8px;color:#075985;user-select:all;-webkit-user-select:all;">{{ $code }}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:8px 28px 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#334155;text-align:center;">
                            This code expires in <strong>{{ $minutes }} minutes</strong> and can be used only once.
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:24px 28px 28px 28px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="border-top:1px solid #e2e8f0;padding-top:16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:19px;color:#64748b;text-align:center;">
                                        If you did not request this, you can ignore this email and tell an administrator. Never share this code with anyone.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <div style="max-width:480px;padding:16px 8px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#94a3b8;text-align:center;">
                    Army Medical School, Philippine Army, Army Medical Corps
                </div>
            </td>
        </tr>
    </table>
</body>
</html>