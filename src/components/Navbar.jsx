            {showNotifications && (
              <div className="fixed top-[64px] left-1/2 -translate-x-1/2 w-[calc(100vw-32px)] sm:absolute sm:top-auto sm:left-auto sm:translate-x-0 sm:right-0 sm:mt-2 sm:w-80 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-primary)]/40">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Notifications</h3>
                  <div className="flex items-center gap-3">
                    {notifications.some(n => !n.isRead) && (
                      <button onClick={handleMarkAllRead} className="text-[11px] font-medium text-accent hover:text-accent-light transition-colors">Mark all read</button>
                    )}
                    {notifications.length > 0 && (
                      <button onClick={handleClearAll} className="text-[11px] font-medium text-red-400 hover:text-red-300 transition-colors">Clear all</button>
                    )}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center">
                      <Bell size={24} className="text-[var(--text-muted)] mb-2" />
                      <div className="text-sm text-slate-400">No notifications</div>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} onClick={() => { handleMarkRead(n._id); if (n.link) navigate(n.link); setShowNotifications(false); }}
                           className={`group relative p-3 border-b border-[var(--border-color)]/5 cursor-pointer hover:bg-[var(--bg-primary)]/40 transition-colors ${!n.isRead ? 'bg-[var(--accent-glow)]/40 border-l-2 border-l-accent' : ''}`}>
                        <div className="flex justify-between items-start mb-1 pr-6">
                          <p className={`text-sm font-semibold ${!n.isRead ? 'text-[var(--text-primary)]' : 'text-slate-400'}`}>{n.title}</p>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2 flex-shrink-0">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 pr-6 leading-normal">{n.message}</p>
                        <button
                          onClick={(e) => handleDelete(n._id, e)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all sm:opacity-0 opacity-100"
                          title="Remove notification"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
