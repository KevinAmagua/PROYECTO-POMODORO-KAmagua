package expo.modules.pomodorocountdown

import android.app.AlarmManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Módulo local: contador en vivo en la notificación (HU-007) y gestión del
 * permiso de alarma exacta (HU-004).
 *
 * Solo visualiza el tiempo restante; la autoridad del tiempo es `endTimestamp`
 * en la capa de dominio.
 */
class PomodoroCountdownModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("PomodoroCountdown")

    AsyncFunction("start") { endTimestamp: Double, title: String, body: String ->
      ForegroundTimerService.start(context, endTimestamp.toLong(), title, body)
    }

    AsyncFunction("stop") {
      ForegroundTimerService.stop(context)
    }

    AsyncFunction("isRunning") {
      ForegroundTimerService.isRunning
    }

    AsyncFunction("canScheduleExactAlarms") {
      val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        alarmManager.canScheduleExactAlarms()
      } else {
        true
      }
    }

    AsyncFunction("requestExactAlarmPermission") {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
          data = Uri.parse("package:${context.packageName}")
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
      }
    }
  }
}
