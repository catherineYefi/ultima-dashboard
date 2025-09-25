import React, { useState, useEffect } from "react";
import {
  Save,
  Download,
  Trophy,
  Users,
  Target,
  CheckSquare,
  MessageSquare,
  FileText,
  TrendingUp,
  Award,
  Info,
  Filter,
  BarChart3,
  Lock,
  Eye,
  Shield,
  Cloud,
  Wifi,
  AlertCircle,
} from "lucide-react";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_ocCyZnuP4bODKjR9sASUI93YrpVKg64",
  authDomain: "ultima-dashboard.firebaseapp.com",
  databaseURL:
    "https://ultima-dashboard-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ultima-dashboard",
  storageBucket: "ultima-dashboard.firebasestorage.app",
  messagingSenderId: "1000478819468",
  appId: "1:1000478819468:web:c33b8ba9ab4db411a6e7a9",
  measurementId: "G-0VQQ6TW0XW",
};

// Firebase Database Manager
class FirebaseDB {
  constructor() {
    this.app = null;
    this.database = null;
    this.auth = null;
    this.listeners = [];
    this.initialized = false;
    this.initPromise = null;
  }

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initInternal();
    return this.initPromise;
  }

  async _initInternal() {
    if (typeof window !== "undefined" && !this.initialized) {
      try {
        // Dynamically load Firebase scripts
        await this.loadScript(
          "https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js"
        );
        await this.loadScript(
          "https://www.gstatic.com/firebasejs/9.15.0/firebase-database-compat.js"
        );
        await this.loadScript(
          "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth-compat.js"
        );

        // Wait a bit more to ensure scripts are fully loaded
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!window.firebase) {
          throw new Error("Firebase failed to load");
        }

        this.app = window.firebase.initializeApp(firebaseConfig);
        this.database = window.firebase.database();
        this.auth = window.firebase.auth();
        this.initialized = true;

        console.log("Firebase initialized successfully");
      } catch (error) {
        console.error("Firebase initialization failed:", error);
        throw error;
      }
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Auth methods
  async login(email, password) {
    try {
      await this.auth.signInWithEmailAndPassword(email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      await this.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  async checkAdminStatus(uid) {
    if (!this.database) return false;
    try {
      const snapshot = await this.database.ref(`admins/${uid}`).once("value");
      return snapshot.val() === true;
    } catch (error) {
      console.error("Admin check error:", error);
      return false;
    }
  }

  // Database methods
  listen(path, callback) {
    if (!this.database) return;
    const ref = this.database.ref(path);
    ref.on("value", callback);
    this.listeners.push({ path, callback, ref });
  }

  unlisten(path, callback) {
    this.listeners = this.listeners.filter((listener) => {
      const match =
        listener.path === path && (!callback || listener.callback === callback);
      if (match) {
        listener.ref.off("value", listener.callback);
      }
      return !match;
    });
  }

  async save(path, data) {
    if (!this.database) {
      return { success: false, error: "Database not initialized" };
    }
    try {
      await this.database.ref(path).set(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

const firebaseDB = new FirebaseDB();

// Auth Component
function AuthForm({ onGuestAccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await firebaseDB.login(email, password);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-purple-300">
            Ultima Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Рейтинг участников 8 сезона
          </p>
        </div>

        {/* Кнопка гостевого доступа */}
        <div className="text-center">
          <button
            onClick={onGuestAccess}
            className="w-full flex justify-center py-3 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            Войти как зритель (только просмотр)
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-800 text-gray-400">или</span>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="text-center text-sm text-gray-300">
            Вход для администраторов
          </div>
          {error && (
            <div className="bg-red-900/20 border border-red-500/20 text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <input
              type="email"
              required
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              placeholder="Email администратора"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              required
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            <Shield className="w-4 h-4 mr-2" />
            {loading ? "Вход..." : "Войти как админ"}
          </button>
        </form>

        <div className="text-xs text-gray-500 text-center">
          В режиме зрителя доступен только просмотр данных
        </div>
      </div>
    </div>
  );
}

const UltimaDashboard = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [participantData, setParticipantData] = useState({});
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [lastSync, setLastSync] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [currentWeek, setCurrentWeek] = useState(1);
  const [viewMode, setViewMode] = useState("groups");
  const [showForm, setShowForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const [formData, setFormData] = useState({
    tasksCompleted: "",
    weeklyGoalsPercent: "",
    attendance: true,
    reflectionsInChat: "",
    artifactsDelivered: true,
    businessMetric: "",
    comments: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const groups = [
    {
      id: 1,
      name: "Ультима 1",
      tracker: "Наташа Лозовая",
      members: [
        "Юлия Кацапенко",
        "Алёна",
        "Дмитрий Романов",
        "Элла",
        "Никита Шиповский",
        "Анна Самсонова",
        "Рудольф Тен",
        "Александр Павлов",
        "Владислав Голодухин",
        "Игорь",
      ],
    },
    {
      id: 2,
      name: "Ультима 2",
      tracker: "Валентин Шпак",
      members: [
        "Иван Каменский",
        "Иван",
        "Андрей Яценко",
        "Антон Баталов",
        "Светлана Павельчук",
        "Елена Дауд",
        "Алексей Слабенко",
        "Светлана Титова",
      ],
    },
    {
      id: 3,
      name: "Ультима 3",
      tracker: "Евгений Дубровин",
      members: [
        "Чамов Сергей",
        "Константин Черкасов",
        "Анатолий Голубенко",
        "Мария Уварова",
        "Алина Гизатулина",
        "Дмитрий",
        "Денис Нечипай",
        "Алексей Лобойко",
        "Аня",
      ],
    },
    {
      id: 4,
      name: "Ультима 4",
      tracker: "Арзуманян Гор",
      members: [
        "Кирилл Литовский",
        "Дмитрий",
        "Анна Русских",
        "Александра Заикина",
        "Сергей Шаволин",
        "Алла Комарова",
        "Татьяна Минвева",
      ],
    },
    {
      id: 5,
      name: "Ультима 5",
      tracker: "Лобойко Алексей",
      members: [
        "Алексей Иванов",
        "Николай",
        "Евгений Поздняк",
        "Станислав",
        "Александра Наумова",
        "Игорь Свечин",
        "Азамат Абишев",
      ],
    },
    {
      id: 6,
      name: "Ультима 6",
      tracker: "Андрей Калашников",
      members: ["Алексей Науменко", "Леонид"],
    },
  ];

  // Auth state listener
  useEffect(() => {
    let unsubscribe;

    const initAuth = async () => {
      try {
        await firebaseDB.init();

        if (!firebaseDB.auth) {
          console.error("Firebase auth not initialized");
          setAuthLoading(false);
          return;
        }

        unsubscribe = firebaseDB.auth.onAuthStateChanged(async (user) => {
          setUser(user);
          if (user) {
            const adminStatus = await firebaseDB.checkAdminStatus(user.uid);
            setIsAdmin(adminStatus);
            if (!adminStatus) {
              alert(
                "У вас нет прав администратора. Вы будете в режиме просмотра."
              );
            }
          } else {
            setIsAdmin(false);
          }
          setAuthLoading(false);
        });
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setAuthLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Guest access function
  const handleGuestAccess = async () => {
    setIsGuest(true);
    setAuthLoading(false);
  };

  // Participants data listener - работает и для гостей
  useEffect(() => {
    if (!user && !isGuest) return;

    const initData = async () => {
      await firebaseDB.init();
      setConnectionStatus("connecting");

      firebaseDB.listen("participants", (snapshot) => {
        if (snapshot.exists()) {
          setParticipantData(snapshot.val());
          setConnectionStatus("connected");
          setLastSync(new Date());
        } else {
          setParticipantData({});
          setConnectionStatus("connected");
        }
      });
    };

    initData();

    return () => {
      firebaseDB.unlisten("participants");
    };
  }, [user, isGuest]);

  const saveToFirebase = async (data) => {
    if (!isAdmin || isSaving) return false;

    setIsSaving(true);
    setConnectionStatus("connecting");

    try {
      const result = await firebaseDB.save("participants", data);
      if (result.success) {
        setConnectionStatus("connected");
        setLastSync(new Date());
        setIsSaving(false);
        return true;
      } else {
        setConnectionStatus("error");
        console.error("Save error:", result.error);
        setIsSaving(false);
        return false;
      }
    } catch (error) {
      setConnectionStatus("error");
      console.error("Save error:", error);
      setIsSaving(false);
      return false;
    }
  };

  const createParticipantKey = (groupId, participant, week) => {
    return (
      groupId.toString() +
      "_" +
      participant.replace(/\s+/g, "_") +
      "_" +
      week.toString()
    );
  };

  const calculateParticipantScore = (data) => {
    let score = 0;

    const tasks = Math.max(0, Math.min(5, parseInt(data.tasksCompleted) || 0));
    const goals = Math.max(
      0,
      Math.min(100, parseInt(data.weeklyGoalsPercent) || 0)
    );
    const reflections = Math.max(
      0,
      Math.min(5, parseInt(data.reflectionsInChat) || 0)
    );

    score += tasks * 5;
    score += Math.round(goals * 0.2);
    score += data.attendance ? 15 : 0;
    score += reflections * 4;
    score += data.artifactsDelivered ? 10 : 0;
    score += data.businessMetric === "positive" ? 10 : 0;

    return Math.max(0, Math.min(100, score));
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.tasksCompleted && !data.weeklyGoalsPercent) {
      errors.general =
        "Заполните хотя бы одно из полей: Задачи или Цели недели";
    }

    const tasks = parseInt(data.tasksCompleted);
    if (data.tasksCompleted && (isNaN(tasks) || tasks < 0 || tasks > 5)) {
      errors.tasksCompleted = "Количество задач должно быть от 0 до 5";
    }

    const goals = parseInt(data.weeklyGoalsPercent);
    if (data.weeklyGoalsPercent && (isNaN(goals) || goals < 0 || goals > 100)) {
      errors.weeklyGoalsPercent = "Процент должен быть от 0 до 100";
    }

    const reflections = parseInt(data.reflectionsInChat);
    if (
      data.reflectionsInChat &&
      (isNaN(reflections) || reflections < 0 || reflections > 5)
    ) {
      errors.reflectionsInChat = "Количество рефлексий должно быть от 0 до 5";
    }

    return errors;
  };

  const saveParticipantData = async () => {
    if (!isAdmin) {
      alert("У вас нет прав для внесения изменений");
      return;
    }

    const errors = validateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const score = calculateParticipantScore(formData);
    const key = createParticipantKey(
      selectedGroup,
      selectedParticipant,
      currentWeek
    );

    const newParticipantData = {
      ...participantData,
      [key]: {
        ...formData,
        score,
        tasksCompleted: parseInt(formData.tasksCompleted) || 0,
        weeklyGoalsPercent: parseInt(formData.weeklyGoalsPercent) || 0,
        reflectionsInChat: parseInt(formData.reflectionsInChat) || 0,
        timestamp: new Date().toISOString(),
        updatedBy: user?.email || "admin",
      },
    };

    setParticipantData(newParticipantData);

    const success = await saveToFirebase(newParticipantData);

    if (success) {
      resetForm();
    } else {
      alert("Ошибка сохранения. Проверьте подключение к интернету.");
    }
  };

  const resetForm = () => {
    setFormData({
      tasksCompleted: "",
      weeklyGoalsPercent: "",
      attendance: true,
      reflectionsInChat: "",
      artifactsDelivered: true,
      businessMetric: "",
      comments: "",
    });
    setFormErrors({});
    setShowForm(false);
    setSelectedGroup(null);
    setSelectedParticipant(null);
  };

  const getParticipantData = (groupId, participant, week) => {
    const key = createParticipantKey(groupId, participant, week);
    return participantData[key] || null;
  };

  const getParticipantRanking = () => {
    const allParticipants = [];
    groups.forEach((group) => {
      group.members.forEach((member) => {
        const data = getParticipantData(group.id, member, currentWeek);
        const participant = {
          name: member,
          groupId: group.id,
          groupName: group.name,
          weekData: data,
        };

        if (filterStatus === "with_data" && !data) return;
        if (filterStatus === "without_data" && data) return;

        allParticipants.push(participant);
      });
    });

    return allParticipants.sort((a, b) => {
      const scoreA = a.weekData?.score || 0;
      const scoreB = b.weekData?.score || 0;
      return scoreB - scoreA;
    });
  };

  const getGroupRanking = () => {
    return groups
      .map((group) => {
        const participantScores = group.members.map((member) => {
          const data = getParticipantData(group.id, member, currentWeek);
          return data?.score || 0;
        });

        const scoresWithData = participantScores.filter((score) => score > 0);
        const totalScore = participantScores.reduce(
          (sum, score) => sum + score,
          0
        );
        const avgScore =
          scoresWithData.length > 0 ? totalScore / scoresWithData.length : 0;
        const completionRate =
          (scoresWithData.length / group.members.length) * 100;
        const highPerformers = scoresWithData.filter(
          (score) => score >= 80
        ).length;

        return {
          ...group,
          totalScore,
          avgScore: Math.round(avgScore * 10) / 10,
          participantsWithData: scoresWithData.length,
          completionRate: Math.round(completionRate),
          highPerformers,
          participantScores,
        };
      })
      .sort((a, b) => b.avgScore - a.avgScore);
  };

  const getOverallStats = () => {
    const totalParticipants = groups.reduce(
      (sum, group) => sum + group.members.length,
      0
    );
    const dataEntries = Object.keys(participantData).length;
    const weeklyEntries = Object.keys(participantData).filter((key) =>
      key.endsWith("_" + currentWeek)
    ).length;
    const avgScore = Object.values(participantData)
      .filter((data) => data.score > 0)
      .reduce((sum, data, _, arr) => sum + data.score / arr.length, 0);

    return {
      totalParticipants,
      dataEntries,
      weeklyEntries,
      avgScore: Math.round(avgScore * 10) / 10,
      completionRate: Math.round((weeklyEntries / totalParticipants) * 100),
    };
  };

  const exportData = () => {
    const stats = getOverallStats();
    const exportObj = {
      participantData,
      groups,
      stats,
      exportDate: new Date().toISOString(),
      currentWeek,
      exportedBy: user?.email || "unknown",
      lastSync: lastSync?.toISOString(),
    };

    const dataStr = JSON.stringify(exportObj, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ultima-dashboard-week-${currentWeek}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
        <div className="text-lg text-white">Загрузка...</div>
      </div>
    );
  }

  // Not authenticated and not guest
  if (!user && !isGuest) {
    return <AuthForm onGuestAccess={handleGuestAccess} />;
  }

  // Authenticated but not admin - show as viewer
  if (user && !isAdmin) {
    // Продолжаем работу как зритель
  }

  const stats = getOverallStats();
  const isViewer = isGuest || (!isAdmin && user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-purple-300 mb-2">
              Ultima Dashboard
            </h1>
            <p className="text-gray-300">
              Рейтинг участников и групп - 8 сезон
            </p>
            <div className="flex gap-4 mt-2 text-sm text-gray-400">
              <span>Участников: {stats.totalParticipants}</span>
              <span>Данных на неделю: {stats.weeklyEntries}</span>
              <span>Заполнено: {stats.completionRate}%</span>
              {stats.avgScore > 0 && (
                <span>Средний балл: {stats.avgScore}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Статус подключения */}
            <div className="flex flex-col items-end text-xs">
              <div className="flex items-center gap-2">
                {connectionStatus === "connected" && (
                  <>
                    <Cloud className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Подключено</span>
                  </>
                )}
                {connectionStatus === "connecting" && (
                  <>
                    <Wifi className="w-4 h-4 text-yellow-400 animate-pulse" />
                    <span className="text-yellow-400">Подключение...</span>
                  </>
                )}
                {connectionStatus === "error" && (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">Ошибка</span>
                  </>
                )}
              </div>
              {lastSync && (
                <span className="text-gray-500 mt-1">
                  {lastSync.toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Статус пользователя */}
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <>
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">Админ</span>
                  <span className="text-xs text-gray-400">({user.email})</span>
                </>
              ) : isGuest ? (
                <>
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-400">Гость</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400">Зритель</span>
                  <span className="text-xs text-gray-400">({user.email})</span>
                </>
              )}

              <button
                onClick={() => {
                  if (isGuest) {
                    window.location.reload();
                  } else {
                    firebaseDB.logout();
                  }
                }}
                className="px-3 py-1 bg-slate-600 hover:bg-slate-700 rounded text-sm transition-colors"
              >
                Выйти
              </button>
            </div>

            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Экспорт
            </button>
          </div>
        </div>

        {/* Управление */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="text-sm text-gray-300 block mb-1">
                  Неделя
                </label>
                <select
                  value={currentWeek}
                  onChange={(e) => setCurrentWeek(Number(e.target.value))}
                  className="bg-slate-700 text-white rounded-lg px-3 py-2"
                >
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Неделя {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-300 block mb-1">
                  Режим
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("groups")}
                    className={
                      "px-3 py-2 rounded-lg text-sm transition-colors " +
                      (viewMode === "groups"
                        ? "bg-purple-600"
                        : "bg-slate-700 hover:bg-slate-600")
                    }
                  >
                    🏆 Группы
                  </button>
                  <button
                    onClick={() => setViewMode("participants")}
                    className={
                      "px-3 py-2 rounded-lg text-sm transition-colors " +
                      (viewMode === "participants"
                        ? "bg-purple-600"
                        : "bg-slate-700 hover:bg-slate-600")
                    }
                  >
                    👤 Участники
                  </button>
                  <button
                    onClick={() => setViewMode("metrics")}
                    className={
                      "px-3 py-2 rounded-lg text-sm transition-colors " +
                      (viewMode === "metrics"
                        ? "bg-purple-600"
                        : "bg-slate-700 hover:bg-slate-600")
                    }
                  >
                    📊 Система
                  </button>
                </div>
              </div>

              {viewMode === "participants" && (
                <div>
                  <label className="text-sm text-gray-300 block mb-1">
                    Фильтр
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">Все участники</option>
                    <option value="with_data">С данными</option>
                    <option value="without_data">Без данных</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Система оценки */}
        {viewMode === "metrics" && (
          <div className="bg-slate-800/50 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Info className="w-6 h-6 text-blue-400" />
              Система оценки участников (макс 100 баллов)
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CheckSquare className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-300">
                      Выполненные задачи
                    </h3>
                    <p className="text-sm text-gray-300">
                      Количество выполненных еженедельных задач
                    </p>
                  </div>
                  <span className="text-sm bg-purple-800 px-3 py-1 rounded font-bold">
                    25б
                  </span>
                </div>
                <div className="text-xs text-gray-400 bg-slate-800/50 p-2 rounded">
                  По 5 баллов за задачу (максимум 5 задач)
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-300">
                      Цели недели
                    </h3>
                    <p className="text-sm text-gray-300">
                      Процент выполнения поставленных целей
                    </p>
                  </div>
                  <span className="text-sm bg-purple-800 px-3 py-1 rounded font-bold">
                    20б
                  </span>
                </div>
                <div className="text-xs text-gray-400 bg-slate-800/50 p-2 rounded">
                  20 баллов при 100% выполнении
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-300">
                      Посещаемость
                    </h3>
                    <p className="text-sm text-gray-300">
                      Присутствие на встречах
                    </p>
                  </div>
                  <span className="text-sm bg-purple-800 px-3 py-1 rounded font-bold">
                    15б
                  </span>
                </div>
                <div className="text-xs text-gray-400 bg-slate-800/50 p-2 rounded">
                  15 баллов за участие, 0 за отсутствие
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-300">
                      Рефлексии в чате
                    </h3>
                    <p className="text-sm text-gray-300">Активность в группе</p>
                  </div>
                  <span className="text-sm bg-purple-800 px-3 py-1 rounded font-bold">
                    20б
                  </span>
                </div>
                <div className="text-xs text-gray-400 bg-slate-800/50 p-2 rounded">
                  По 4 балла за рефлексию (макс 5)
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-300">Артефакты</h3>
                    <p className="text-sm text-gray-300">
                      Своевременная сдача материалов
                    </p>
                  </div>
                  <span className="text-sm bg-purple-800 px-3 py-1 rounded font-bold">
                    10б
                  </span>
                </div>
                <div className="text-xs text-gray-400 bg-slate-800/50 p-2 rounded">
                  10 баллов за сдачу, 0 за несдачу
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-300">
                      Бизнес-метрика
                    </h3>
                    <p className="text-sm text-gray-300">
                      Рост ключевых показателей
                    </p>
                  </div>
                  <span className="text-sm bg-purple-800 px-3 py-1 rounded font-bold">
                    10б
                  </span>
                </div>
                <div className="text-xs text-gray-400 bg-slate-800/50 p-2 rounded">
                  10 баллов при положительной динамике
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-2">Рейтинг групп</h3>
              <p className="text-sm text-gray-300">
                Рассчитывается на основе среднего балла участников с данными в
                группе.
              </p>
            </div>
          </div>
        )}

        {/* Рейтинг групп */}
        {viewMode === "groups" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Рейтинг групп - Неделя {currentWeek}
            </h2>

            {getGroupRanking().map((group, index) => {
              const positionClass =
                index === 0
                  ? "bg-yellow-500 text-black"
                  : index === 1
                  ? "bg-slate-400 text-black"
                  : index === 2
                  ? "bg-orange-500 text-black"
                  : "bg-slate-600";

              return (
                <div
                  key={group.id}
                  className="bg-slate-800/50 rounded-xl p-5 hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={
                          "w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold " +
                          positionClass
                        }
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{group.name}</h3>
                        <p className="text-sm text-gray-300">
                          Трекер: {group.tracker}
                        </p>
                        <div className="flex gap-4 text-xs text-gray-400 mt-1">
                          <span>Участников: {group.members.length}</span>
                          <span>С данными: {group.participantsWithData}</span>
                          <span>Заполнено: {group.completionRate}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold">{group.avgScore}</div>
                      <div className="text-sm text-gray-400">средний балл</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-4">
                    {group.members.map((member) => {
                      const memberData = getParticipantData(
                        group.id,
                        member,
                        currentWeek
                      );
                      const scoreClass = memberData
                        ? memberData.score >= 80
                          ? "text-green-400"
                          : memberData.score >= 60
                          ? "text-yellow-400"
                          : memberData.score >= 40
                          ? "text-orange-400"
                          : "text-red-400"
                        : "text-gray-500";

                      return (
                        <div
                          key={member}
                          className="bg-slate-700/30 rounded p-2 text-center hover:bg-slate-700/50 transition-colors"
                        >
                          <div
                            className="text-xs text-gray-300 truncate"
                            title={member}
                          >
                            {member}
                          </div>
                          <div
                            className={"text-sm font-bold mt-1 " + scoreClass}
                          >
                            {memberData ? memberData.score : "—"}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="w-full bg-slate-600 rounded-full h-3 mt-4">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: Math.min(group.avgScore, 100) + "%" }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Рейтинг участников */}
        {viewMode === "participants" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Award className="w-6 h-6 text-blue-500" />
                Рейтинг участников - Неделя {currentWeek}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Filter className="w-4 h-4" />
                Показано: {getParticipantRanking().length} из{" "}
                {stats.totalParticipants}
              </div>
            </div>

            <div className="grid gap-3">
              {getParticipantRanking()
                .slice(0, 20)
                .map((participant, index) => {
                  const positionClass =
                    index === 0
                      ? "bg-yellow-500 text-black"
                      : index === 1
                      ? "bg-slate-400 text-black"
                      : index === 2
                      ? "bg-orange-500 text-black"
                      : index < 5
                      ? "bg-green-700"
                      : index < 10
                      ? "bg-blue-700"
                      : "bg-slate-600";

                  return (
                    <div
                      key={participant.groupId + "_" + participant.name}
                      className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={
                            "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold " +
                            positionClass
                          }
                        >
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{participant.name}</h4>
                          <p className="text-sm text-gray-400">
                            {participant.groupName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {participant.weekData ? (
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {participant.weekData.score}
                            </div>
                            <div className="text-xs text-gray-300">
                              Задачи: {participant.weekData.tasksCompleted} •
                              Цели: {participant.weekData.weeklyGoalsPercent}%
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm">
                              Нет данных
                            </span>
                            {isAdmin && (
                              <button
                                onClick={() => {
                                  setSelectedGroup(participant.groupId);
                                  setSelectedParticipant(participant.name);
                                  setShowForm(true);
                                }}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                              >
                                Добавить
                              </button>
                            )}
                          </div>
                        )}

                        <div className="w-20 bg-slate-600 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: (participant.weekData?.score || 0) + "%",
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Быстрое добавление для админов */}
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Добавить данные участников
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => {
                  const groupStats = group.members.reduce(
                    (acc, member) => {
                      const hasData = getParticipantData(
                        group.id,
                        member,
                        currentWeek
                      );
                      if (hasData) acc.withData++;
                      else acc.withoutData++;
                      return acc;
                    },
                    { withData: 0, withoutData: 0 }
                  );

                  return (
                    <div
                      key={group.id}
                      className="bg-slate-800/30 rounded-lg p-4 border-l-4 border-green-500"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold">{group.name}</h4>
                        <div className="text-xs bg-slate-700 px-2 py-1 rounded">
                          {groupStats.withData}/{group.members.length}
                        </div>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {group.members.map((member) => {
                          const hasData = getParticipantData(
                            group.id,
                            member,
                            currentWeek
                          );
                          return (
                            <div
                              key={member}
                              className="flex justify-between items-center"
                            >
                              <div className="flex-1">
                                <span
                                  className={
                                    "text-sm " +
                                    (hasData
                                      ? "text-green-400"
                                      : "text-gray-400")
                                  }
                                >
                                  {member}
                                </span>
                                {hasData && (
                                  <span className="ml-2 text-xs bg-green-800 px-2 py-0.5 rounded">
                                    {hasData.score}б
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedGroup(group.id);
                                  setSelectedParticipant(member);
                                  setShowForm(true);
                                }}
                                className={
                                  "px-2 py-1 rounded text-xs transition-colors " +
                                  (hasData
                                    ? "bg-slate-600 hover:bg-slate-700 text-gray-300"
                                    : "bg-blue-600 hover:bg-blue-700")
                                }
                              >
                                {hasData ? "✏️" : "+"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Форма ввода - только для админов */}
        {showForm && isAdmin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-green-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-bold">
                  {selectedParticipant} (
                  {groups.find((g) => g.id === selectedGroup)?.name}) - Неделя{" "}
                  {currentWeek}
                </h3>
              </div>

              {formErrors.general && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg text-red-300 text-sm">
                  {formErrors.general}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Выполненные задачи (0-5)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={formData.tasksCompleted}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tasksCompleted: e.target.value,
                      })
                    }
                    className={
                      "w-full px-3 py-2 bg-slate-700 rounded-lg text-white " +
                      (formErrors.tasksCompleted ? "border border-red-500" : "")
                    }
                    placeholder="3"
                  />
                  {formErrors.tasksCompleted && (
                    <p className="text-red-400 text-xs mt-1">
                      {formErrors.tasksCompleted}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Цели недели (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.weeklyGoalsPercent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weeklyGoalsPercent: e.target.value,
                      })
                    }
                    className={
                      "w-full px-3 py-2 bg-slate-700 rounded-lg text-white " +
                      (formErrors.weeklyGoalsPercent
                        ? "border border-red-500"
                        : "")
                    }
                    placeholder="80"
                  />
                  {formErrors.weeklyGoalsPercent && (
                    <p className="text-red-400 text-xs mt-1">
                      {formErrors.weeklyGoalsPercent}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Посещаемость
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="attendance"
                        checked={formData.attendance === true}
                        onChange={() =>
                          setFormData({ ...formData, attendance: true })
                        }
                      />
                      <span className="text-sm">Присутствовал</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="attendance"
                        checked={formData.attendance === false}
                        onChange={() =>
                          setFormData({ ...formData, attendance: false })
                        }
                      />
                      <span className="text-sm">Отсутствовал</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Рефлексии в чате (0-5)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={formData.reflectionsInChat}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reflectionsInChat: e.target.value,
                      })
                    }
                    className={
                      "w-full px-3 py-2 bg-slate-700 rounded-lg text-white " +
                      (formErrors.reflectionsInChat
                        ? "border border-red-500"
                        : "")
                    }
                    placeholder="2"
                  />
                  {formErrors.reflectionsInChat && (
                    <p className="text-red-400 text-xs mt-1">
                      {formErrors.reflectionsInChat}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Артефакты
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="artifacts"
                        checked={formData.artifactsDelivered === true}
                        onChange={() =>
                          setFormData({ ...formData, artifactsDelivered: true })
                        }
                      />
                      <span className="text-sm">Сданы</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="artifacts"
                        checked={formData.artifactsDelivered === false}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            artifactsDelivered: false,
                          })
                        }
                      />
                      <span className="text-sm">Не сданы</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Бизнес-метрика
                  </label>
                  <select
                    value={formData.businessMetric}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessMetric: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-700 rounded-lg text-white"
                  >
                    <option value="">Выберите</option>
                    <option value="positive">Рост показателей</option>
                    <option value="neutral">Без изменений</option>
                    <option value="negative">Снижение</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Комментарии
                  </label>
                  <textarea
                    value={formData.comments}
                    onChange={(e) =>
                      setFormData({ ...formData, comments: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-700 rounded-lg h-16 text-white"
                    placeholder="Дополнительные заметки..."
                  />
                </div>

                <div className="text-sm text-gray-400 bg-slate-700/30 p-3 rounded">
                  <div className="font-bold mb-2">
                    Предварительный скор: {calculateParticipantScore(formData)}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveParticipantData}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Сохранение..." : "Сохранить"}
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UltimaDashboard;
