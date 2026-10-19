package expo.modules.pomodorocountdown

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat

/**
 * Servicio en primer plano que mantiene una notificación persistente con el
 * tiempo restante de la fase (HU-007).
 *
 * La cuenta atrás la dibuja el propio sistema con el cronómetro en modo
 * descendente (`setUsesChronometer` + `setChronometerCountDown` + `setWhen`),
 * de modo que avanza sin intervención de JS y sobrevive a la app cerrada.
 */
class ForegroundTimerService : Service() {

  companion object {
    private const val CHANNEL_ID = "pomodoro-countdown"
    private const val NOTIFICATION_ID = 7411
    private const val EXTRA_END = "endTimestamp"
    private const val EXTRA_TITLE = "title"
    private const val EXTRA_BODY = "body"
    private const val ACCENT_COLOR = 0xFF1E1F6E.toInt()

    @Volatile
    var isRunning: Boolean = false
      private set

    fun start(context: Context, endTimestamp: Long, title: String, body: String) {
      val intent = Intent(context, ForegroundTimerService::class.java).apply {
        putExtra(EXTRA_END, endTimestamp)
        putExtra(EXTRA_TITLE, title)
        putExtra(EXTRA_BODY, body)
      }
      ContextCompat.startForegroundService(context, intent)
    }

    fun stop(context: Context) {
      context.stopService(Intent(context, ForegroundTimerService::class.java))
    }
  }

  private var endTimestamp: Long = 0L
  private var title: String = ""
  private var body: String = ""

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    endTimestamp = intent?.getLongExtra(EXTRA_END, System.currentTimeMillis())
      ?: System.currentTimeMillis()
    intent?.getStringExtra(EXTRA_TITLE)?.let { title = it }
    intent?.getStringExtra(EXTRA_BODY)?.let { body = it }

    ensureChannel()
    startOrUpdateForeground()
    isRunning = true
    return START_STICKY
  }

  override fun onDestroy() {
    isRunning = false
    ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
    super.onDestroy()
  }

  private fun ensureChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (manager.getNotificationChannel(CHANNEL_ID) != null) {
      return
    }
    val channel = NotificationChannel(
      CHANNEL_ID,
      "Pomodoro en curso",
      NotificationManager.IMPORTANCE_LOW
    ).apply {
      description = "Muestra el tiempo restante de la fase en curso."
      setShowBadge(false)
      lockscreenVisibility = Notification.VISIBILITY_PUBLIC
    }
    manager.createNotificationChannel(channel)
  }

  private fun startOrUpdateForeground() {
    val notification = buildNotification()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      ServiceCompat.startForeground(
        this,
        NOTIFICATION_ID,
        notification,
        ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
      )
    } else {
      startForeground(NOTIFICATION_ID, notification)
    }
  }

  private fun buildNotification(): Notification {
    val builder = NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(smallIcon())
      .setContentTitle(title)
      .setContentText(body)
      .setColor(ACCENT_COLOR)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setShowWhen(true)
      .setUsesChronometer(true)
      .setWhen(endTimestamp)
      .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      builder.setChronometerCountDown(true)
    }

    contentIntent()?.let(builder::setContentIntent)
    return builder.build()
  }

  private fun smallIcon(): Int {
    val icon = applicationInfo.icon
    return if (icon != 0) icon else android.R.drawable.ic_dialog_info
  }

  private fun contentIntent(): PendingIntent? {
    val launchIntent = packageManager.getLaunchIntentForPackage(packageName) ?: return null
    return PendingIntent.getActivity(
      this,
      0,
      launchIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }
}
