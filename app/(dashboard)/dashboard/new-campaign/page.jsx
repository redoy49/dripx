"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, Settings, FileText, Plus, Trash2 } from "lucide-react";
import LeadSourceModal from "@/app/(dashboard)/dashboard/new-campaign/LeadSourceModal";
import SequenceBuilder from "@/app/(dashboard)/dashboard/new-campaign/SequenceBuilder";
import CampaignSettingsTab from "@/app/(dashboard)/dashboard/new-campaign/CampaignSettingsTab";

function NewCampaignInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get("id");

  const [campaignId, setCampaignId] = useState(idFromUrl);
  const [campaign, setCampaign] = useState(null);
  const [enrolledLeads, setEnrolledLeads] = useState([]);
  const [activeTab, setActiveTab] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 1, title: "Add Leads", icon: Users },
    { id: 2, title: "Create a Sequence", icon: FileText },
    { id: 3, title: "Settings", icon: Settings },
  ];

  const loadCampaignLeads = useCallback(async (id) => {
    const res = await fetch(`/api/campaigns/${id}/leads`);
    if (res.ok) {
      const data = await res.json();
      setEnrolledLeads(data.items);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      let id = idFromUrl;

      if (!id) {
        const res = await fetch("/api/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Untitled Campaign" }),
        });
        const created = await res.json();
        if (cancelled) return;
        id = created.id;
        router.replace(`/dashboard/new-campaign?id=${id}`);
      }

      setCampaignId(id);

      const res = await fetch(`/api/campaigns/${id}`);
      if (res.ok && !cancelled) {
        setCampaign(await res.json());
        await loadCampaignLeads(id);
      }

      if (!cancelled) setLoading(false);
    }

    init();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImported = () => {
    if (campaignId) loadCampaignLeads(campaignId);
  };

  const removeLead = async (leadId) => {
    // Enrollment removal: drop the lead from this campaign only, keep it in the workspace pool.
    await fetch(`/api/campaigns/${campaignId}/leads/${leadId}`, { method: "DELETE" }).catch(
      () => {},
    );
    setEnrolledLeads((prev) => prev.filter((e) => e.leadId !== leadId));
  };

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center rounded-2xl border border-gray-100 bg-white py-28 text-sm text-gray-400">
        Loading campaign...
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');

        * {
          font-family: 'Geist', 'Inter', sans-serif;
        }

        .card-option {
          transition:
            box-shadow 0.18s,
            border-color 0.18s,
            transform 0.18s;
        }

        .card-option:hover {
          box-shadow: 0 4px 20px 0 rgba(99, 103, 255, 0.1);
          transform: translateY(-2px);
        }

        .card-option.active {
          box-shadow:
            0 0 0 2px #6367ff,
            0 4px 20px 0 rgba(99, 103, 255, 0.13);
        }

        .add-btn {
          transition:
            box-shadow 0.15s,
            opacity 0.15s,
            transform 0.15s;
        }

        .add-btn:hover {
          opacity: 0.93;
          box-shadow: 0 6px 24px 0 rgba(99, 103, 255, 0.28);
          transform: translateY(-1px);
        }

        .step-bar {
          transition: width 0.4s cubic-bezier(.4,0,.2,1);
        }

        .modal-enter {
          animation: fadeUp 0.22s cubic-bezier(.4,0,.2,1);
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <div className="min-h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <div className="grid grid-cols-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-center gap-2 py-5 text-sm transition ${
                    active ? "font-semibold text-[#6367FF]" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
                  {tab.title}

                  {active && (
                    <div className="absolute bottom-0 left-0 h-[2.5px] w-full rounded-t-full bg-[#6367FF]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Add Leads */}
        {activeTab === 1 && (
          <>
            {enrolledLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28">
                <div className="relative mb-7">
                  <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-[#F3F2FF] shadow-inner">
                    <FileText size={46} className="text-[#6367FF]" strokeWidth={1.6} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-full border-[3.5px] border-white bg-[#7ED957] shadow-lg">
                    <Plus size={20} className="text-white" strokeWidth={2.8} />
                  </div>
                </div>

                <h2 className="mb-2 text-xl font-semibold tracking-tight text-gray-800">
                  Lists of leads
                </h2>
                <p className="mb-7 text-sm text-gray-400">
                  Add leads from LinkedIn to this campaign
                </p>

                <button
                  onClick={() => setOpenModal(true)}
                  className="add-btn cursor-pointer rounded-xl px-7 py-3 text-sm font-semibold text-white shadow-md"
                  style={{ background: "linear-gradient(135deg, #7C64F5 0%, #AE79F8 100%)" }}
                >
                  Add leads
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">{enrolledLeads.length}</span>{" "}
                    leads in this campaign
                  </p>
                  <button
                    onClick={() => setOpenModal(true)}
                    className="add-btn cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
                    style={{ background: "linear-gradient(135deg, #7C64F5 0%, #AE79F8 100%)" }}
                  >
                    Add more leads
                  </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100">
                  {enrolledLeads.map((e, i) => (
                    <div
                      key={e.leadId}
                      className={`flex items-center justify-between px-5 py-4 ${
                        i !== enrolledLeads.length - 1 ? "border-b border-gray-100" : ""
                      }`}
                    >
                      <div>
                        <p className="text-[14px] font-semibold text-gray-700">
                          {e.lead ? `${e.lead.firstName} ${e.lead.lastName}`.trim() || "Unnamed lead" : "Unnamed lead"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {e.lead?.jobTitle}
                          {e.lead?.jobTitle && e.lead?.company ? " at " : ""}
                          {e.lead?.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-gray-400 capitalize">
                          {e.status}
                        </span>
                        <button
                          onClick={() => removeLead(e.leadId)}
                          className="text-gray-300 transition hover:text-red-400"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Tab 2: Create a Sequence */}
        {activeTab === 2 && <SequenceBuilder campaignId={campaignId} />}

        {/* Tab 3: Settings */}
        {activeTab === 3 && campaign && (
          <CampaignSettingsTab
            campaignId={campaignId}
            campaign={campaign}
            onCampaignChange={setCampaign}
          />
        )}
      </div>

      <LeadSourceModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        campaignId={campaignId}
        onImported={handleImported}
      />
    </>
  );
}

export default function NewCampaignPage() {
  return (
    <Suspense fallback={null}>
      <NewCampaignInner />
    </Suspense>
  );
}
