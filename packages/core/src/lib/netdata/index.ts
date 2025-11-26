import * as alerts from "@core/lib/netdata/alerts"
import * as badges from "@core/lib/netdata/badges"
import * as charts from "@core/lib/netdata/charts"
import * as config from "@core/lib/netdata/config"
import * as contexts from "@core/lib/netdata/contexts"
import * as core from "@core/lib/netdata/core"
import * as cpu from "@core/lib/netdata/cpu"
import * as data from "@core/lib/netdata/data"
import * as functions from "@core/lib/netdata/functions"
import * as management from "@core/lib/netdata/management"
import * as metrics from "@core/lib/netdata/metrics"
import * as nodes from "@core/lib/netdata/nodes"
import * as system from "@core/lib/netdata/system"
import * as weights from "@core/lib/netdata/weights"

export const netdata = {
  alerts,
  badges,
  charts,
  config,
  contexts,
  core,
  cpu,
  data,
  functions,
  management,
  nodes,
  weights,
  system,
  metrics,
}
