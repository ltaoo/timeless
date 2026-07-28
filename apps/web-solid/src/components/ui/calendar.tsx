import { createSignal, For, JSX } from "solid-js";
import { ChevronLeft, ChevronRight } from "lucide-solid";

import {  CalendarCore  } from "@timeless/inner-kit";
                              >
                                {date.text}
                              </button>
                            </td>
                          );
                        }}
                      </For>
                    </tr>
                  );
                }}
              </For>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
